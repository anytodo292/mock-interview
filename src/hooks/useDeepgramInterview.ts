import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AgentMicrophone,
  AgentPlayer,
  AgentSession,
  ConversationTextMessage,
} from '@deepgram/agents';

import {
  fetchAgentBuild,
  fetchDeepgramToken,
  notifyInterviewStarted,
} from '../services/deepgramApi';
import { InterviewStartParams, InterviewTranscript } from '../components/Interview/types';

export type InterviewStatus =
  'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'ended' | 'error';

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
  userSpeaking: boolean;
  elapsedSeconds: number;
  sessionId: string | null;
  error: string | null;
  transcriptList: InterviewTranscript[];
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
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptList, setTranscriptList] = useState<InterviewTranscript[]>([]);

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
  const elapsedTimerRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const pauseStartedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const startNotificationSentRef = useRef(false);

  callbacksRef.current = callbacks;

  const releaseResources = useCallback((): void => {
    if (playbackMonitorRef.current !== null) {
      window.clearTimeout(playbackMonitorRef.current);
      playbackMonitorRef.current = null;
    }
    if (elapsedTimerRef.current !== null) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    sessionStartedAtRef.current = null;
    pauseStartedAtRef.current = null;
    totalPausedMsRef.current = 0;
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
    setUserSpeaking(false);
    setElapsedSeconds(0);
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
    setUserSpeaking(false);
    setElapsedSeconds(0);
    setSessionId(null);
    setError(null);
    setTranscriptList([]);
    setStatus('idle');
  }, [releaseResources]);

  const start = useCallback(
    async ({ msId, interviewId, ...params }: InterviewStartParams): Promise<void> => {
      // This is the application's correlation ID for the complete interview lifecycle.
      // Deepgram's Welcome message does not always expose a session ID.
      const clientSessionId = crypto.randomUUID();

      intentionalEndRef.current = false;
      releaseResources();
      setError(null);
      setMuted(false);
      setPaused(false);
      setAgentSpeaking(false);
      setUserSpeaking(false);
      setElapsedSeconds(0);
      setSessionId(clientSessionId);
      mutedRef.current = false;
      pausedRef.current = false;
      setTranscriptList([]);
      transcriptIdRef.current = 0;
      startNotificationSentRef.current = false;
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

        const notifyStart = (): void => {
          if (startNotificationSentRef.current || !interviewId) return;

          if (!Number.isInteger(interviewId)) return;

          startNotificationSentRef.current = true;
          void notifyInterviewStarted(msId, interviewId, clientSessionId).catch(
            (notificationError) => {
              console.error('Interview start notification failed:', notificationError);
            },
          );
        };

        const handleRuntimeError = (runtimeError: unknown): void => {
          intentionalEndRef.current = true;
          releaseResources();
          setUserSpeaking(false);
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
          setUserSpeaking(false);
          if (!pausedRef.current) {
            setStatus('speaking');
            callbacksRef.current.onAgentSpeaking();
          }
        });
        session.on('settings-applied', () => {
          setUserSpeaking(false);
          notifyStart();
          if (sessionStartedAtRef.current === null) {
            sessionStartedAtRef.current = Date.now();
            pauseStartedAtRef.current = null;
            totalPausedMsRef.current = 0;
            setElapsedSeconds(0);
            elapsedTimerRef.current = window.setInterval(() => {
              const startedAt = sessionStartedAtRef.current;
              if (startedAt === null) return;

              const currentPauseMs = pauseStartedAtRef.current
                ? Date.now() - pauseStartedAtRef.current
                : 0;
              const activeMs = Date.now() - startedAt - totalPausedMsRef.current - currentPauseMs;
              setElapsedSeconds(Math.max(0, Math.floor(activeMs / 1000)));
            }, 250);
          }
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('conversation-text', (message: ConversationTextMessage) => {
          const content = message.content?.trim();
          if (!content) return;

          const role = message.role === 'agent' ? 'assistant' : message.role;
          if (role !== 'user' && role !== 'assistant') return;

          transcriptIdRef.current += 1;
          setTranscriptList((prevList) => [
            ...prevList,
            {
              id: transcriptIdRef.current,
              speaker: role === 'user' ? 'you' : 'interviewer',
              talk: content,
              capturedAt: new Date().toISOString(),
            },
          ]);
        });
        session.on('user-started-speaking', () => {
          player.interrupt();
          stopPlaybackMonitor();
          setAgentSpeaking(false);
          setUserSpeaking(true);
          if (pausedRef.current) return;
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('agent-thinking', () => {
          setUserSpeaking(false);
          if (pausedRef.current) return;
          setStatus('thinking');
          callbacksRef.current.onThinking();
        });
        session.on('agent-started-speaking', () => {
          setUserSpeaking(false);
          if (pausedRef.current) return;
          setAgentSpeaking(true);
          setStatus('speaking');
          callbacksRef.current.onAgentSpeaking();
        });
        session.on('agent-audio-done', waitForPlaybackToFinish);
        session.on('reconnecting', () => setStatus('connecting'));
        session.on('disconnected', (reason) => {
          if (intentionalEndRef.current) return;
          setUserSpeaking(false);
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
      if (!currentMuted) setUserSpeaking(false);
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
        if (pauseStartedAtRef.current !== null) {
          totalPausedMsRef.current += Date.now() - pauseStartedAtRef.current;
          pauseStartedAtRef.current = null;
        }
        player.unmute();
        if (!mutedRef.current) microphone.unmute();
        setStatus(statusBeforePauseRef.current);
      } else {
        pauseStartedAtRef.current = Date.now();
        statusBeforePauseRef.current = status;
        setUserSpeaking(false);
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
    userSpeaking,
    elapsedSeconds,
    sessionId,
    error,
    transcriptList,
    start,
    end,
    reset,
    toggleMute,
    togglePause,
  };
}
