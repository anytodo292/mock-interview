import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AgentMicrophone,
  AgentPlayer,
  AgentSession,
  ConversationTextMessage,
} from '@deepgram/agents';

import { fetchAgentBuild, fetchDeepgramToken } from '../services/deepgramApi';
import { InterviewStartParams } from '../components/Interview/types';

export type InterviewStatus =
  'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'ended' | 'error';

export interface TranscriptEntry {
  id: number;
  role: string;
  content: string;
}

interface InterviewCallbacks {
  onReady: () => void;
  onThinking: () => void;
  onAgentSpeaking: () => void;
}

interface DeepgramInterview {
  status: InterviewStatus;
  muted: boolean;
  paused: boolean;
  agentSpeaking: boolean;
  error: string | null;
  transcript: TranscriptEntry[];
  start: (params: InterviewStartParams) => Promise<void>;
  end: () => void;
  reset: () => void;
  toggleMute: () => void;
  togglePause: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Microphone access was denied. Allow microphone access and try again.';
  }
  return error instanceof Error ? error.message : 'Unable to start the interview.';
}

export function useDeepgramInterview(callbacks: InterviewCallbacks): DeepgramInterview {
  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const sessionRef = useRef<AgentSession | null>(null);
  const microphoneRef = useRef<AgentMicrophone | null>(null);
  const playerRef = useRef<AgentPlayer | null>(null);
  const callbacksRef = useRef(callbacks);
  const intentionalEndRef = useRef(false);
  const mutedRef = useRef(false);
  const pausedRef = useRef(false);
  const transcriptIdRef = useRef(0);
  const statusBeforePauseRef = useRef<InterviewStatus>('listening');
  const playbackMonitorRef = useRef<number | null>(null);

  callbacksRef.current = callbacks;

  const releaseResources = useCallback((): void => {
    if (playbackMonitorRef.current !== null) {
      window.clearTimeout(playbackMonitorRef.current);
      playbackMonitorRef.current = null;
    }
    microphoneRef.current?.stop();
    sessionRef.current?.disconnect();
    playerRef.current?.dispose();
    microphoneRef.current = null;
    sessionRef.current = null;
    playerRef.current = null;
  }, []);

  const end = useCallback((): void => {
    intentionalEndRef.current = true;
    releaseResources();
    setMuted(false);
    setPaused(false);
    setAgentSpeaking(false);
    mutedRef.current = false;
    pausedRef.current = false;
    setStatus('ended');
  }, [releaseResources]);

  const reset = useCallback((): void => {
    intentionalEndRef.current = true;
    releaseResources();
    mutedRef.current = false;
    pausedRef.current = false;
    setMuted(false);
    setPaused(false);
    setAgentSpeaking(false);
    setError(null);
    setTranscript([]);
    setStatus('idle');
  }, [releaseResources]);

  const start = useCallback(
    async ({ interviewId, ...params }: InterviewStartParams): Promise<void> => {
      intentionalEndRef.current = false;
      releaseResources();
      setError(null);
      setMuted(false);
      setPaused(false);
      setAgentSpeaking(false);
      mutedRef.current = false;
      pausedRef.current = false;
      setTranscript([]);
      transcriptIdRef.current = 0;
      setStatus('connecting');

      try {
        const extensionToken = interviewId ? await fetchDeepgramToken(interviewId) : null;
        const agentBuild = await fetchAgentBuild(params, interviewId);
        const inputSampleRate = agentBuild.audio?.input?.sampleRate ?? 16_000;
        const outputSampleRate = agentBuild.audio?.output?.sampleRate ?? 24_000;
        const session = new AgentSession({
          auth: {
            tokenFactory: extensionToken ? async () => extensionToken : fetchDeepgramToken,
          },
          agent: agentBuild.agent,
          audio: agentBuild.audio,
          tags: agentBuild.tags ?? ['mock-interview'],
          experimental: agentBuild.experimental,
        });
        const player = new AgentPlayer({ sampleRate: outputSampleRate });
        const microphone = new AgentMicrophone((audio) => session.sendAudio(audio), {
          sampleRate: inputSampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });

        sessionRef.current = session;
        playerRef.current = player;
        microphoneRef.current = microphone;

        const handleRuntimeError = (runtimeError: unknown): void => {
          intentionalEndRef.current = true;
          releaseResources();
          setError(getErrorMessage(runtimeError));
          setStatus('error');
        };

        const stopPlaybackMonitor = (): void => {
          if (playbackMonitorRef.current !== null) {
            window.clearTimeout(playbackMonitorRef.current);
            playbackMonitorRef.current = null;
          }
        };

        const waitForPlaybackToFinish = (): void => {
          stopPlaybackMonitor();

          const checkPlayback = (): void => {
            if (player.getRemainingPlaybackTime() > 0.05) {
              playbackMonitorRef.current = window.setTimeout(checkPlayback, 60);
              return;
            }

            playbackMonitorRef.current = null;
            setAgentSpeaking(false);
            if (!pausedRef.current) setStatus('listening');
          };

          playbackMonitorRef.current = window.setTimeout(checkPlayback, 60);
        };

        session.on('audio', (chunk) => {
          player.queue(chunk);
          stopPlaybackMonitor();
          setAgentSpeaking(true);
          if (!pausedRef.current) {
            setStatus('speaking');
            callbacksRef.current.onAgentSpeaking();
          }
        });
        session.on('settings-applied', () => {
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('conversation-text', (message: ConversationTextMessage) => {
          if (!message.content) return;
          transcriptIdRef.current += 1;
          setTranscript((entries) => [
            ...entries,
            { id: transcriptIdRef.current, role: message.role, content: message.content },
          ]);
        });
        session.on('user-started-speaking', () => {
          player.interrupt();
          stopPlaybackMonitor();
          setAgentSpeaking(false);
          if (pausedRef.current) return;
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('agent-thinking', () => {
          if (pausedRef.current) return;
          setStatus('thinking');
          callbacksRef.current.onThinking();
        });
        session.on('agent-started-speaking', () => {
          if (pausedRef.current) return;
          setAgentSpeaking(true);
          setStatus('speaking');
          callbacksRef.current.onAgentSpeaking();
        });
        session.on('agent-audio-done', waitForPlaybackToFinish);
        session.on('reconnecting', () => setStatus('connecting'));
        session.on('disconnected', (reason) => {
          if (intentionalEndRef.current) return;
          setError(reason || 'The voice session disconnected.');
          setStatus('error');
        });
        session.on('error', (message) => {
          handleRuntimeError(new Error(message.description ?? 'Deepgram reported an agent error.'));
        });
        session.on('sdk-error', handleRuntimeError);
        microphone.on('error', handleRuntimeError);

        await session.connect();
        await microphone.start();
      } catch (startError) {
        intentionalEndRef.current = true;
        releaseResources();
        setError(getErrorMessage(startError));
        setStatus('error');
        throw startError;
      }
    },
    [releaseResources],
  );

  const toggleMute = useCallback((): void => {
    const microphone = microphoneRef.current;
    if (!microphone) return;

    setMuted((currentMuted) => {
      mutedRef.current = !currentMuted;
      if (currentMuted && !pausedRef.current) microphone.unmute();
      else microphone.mute();
      return !currentMuted;
    });
  }, []);

  const togglePause = useCallback((): void => {
    const microphone = microphoneRef.current;
    const player = playerRef.current;
    if (!microphone || !player) return;

    setPaused((currentPaused) => {
      pausedRef.current = !currentPaused;
      if (currentPaused) {
        player.unmute();
        if (!mutedRef.current) microphone.unmute();
        setStatus(statusBeforePauseRef.current);
      } else {
        statusBeforePauseRef.current = status;
        microphone.mute();
        player.mute();
        setStatus('paused');
      }
      return !currentPaused;
    });
  }, [status]);

  useEffect(() => () => releaseResources(), [releaseResources]);

  return {
    status,
    muted,
    paused,
    agentSpeaking,
    error,
    transcript,
    start,
    end,
    reset,
    toggleMute,
    togglePause,
  };
}
