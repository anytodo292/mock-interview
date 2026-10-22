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
import { startAgentMicrophoneWithDevice } from '../utils/microphone';
import { MOCK_INTERVIEW_CLOSING_PROMPT, MOCK_INTERVIEW_ENDING_MESSAGE } from '../constants';

export type InterviewStatus =
  'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'ended' | 'error';

const OPTIMIZED_OUTPUT_SAMPLE_RATE = 8_000;
const MAX_CONNECTION_RETRIES = 2;
const INITIAL_GREETING_START_TIMEOUT_MS = 10_000;
const INITIAL_GREETING_COMPLETION_TIMEOUT_MS = 20_000;
const ENDING_TURN_TIMEOUT_MS = 30_000;
const ENDING_PLAYBACK_TIMEOUT_MS = 20_000;
const ENDING_INJECTION_RETRY_MS = 750;

function decodeMuLaw(chunk: ArrayBuffer): ArrayBuffer {
  const encoded = new Uint8Array(chunk);
  const decoded = new Int16Array(encoded.length);

  for (let index = 0; index < encoded.length; index += 1) {
    const value = ~encoded[index] & 0xff;
    const sign = value & 0x80;
    const exponent = (value >> 4) & 0x07;
    const mantissa = value & 0x0f;
    let sample = ((mantissa << 3) + 0x84) << exponent;
    sample -= 0x84;
    decoded[index] = sign ? -sample : sample;
  }

  return decoded.buffer;
}

interface InterviewCallbacks {
  onReady: () => void;
  onThinking: () => void;
  onAgentSpeaking: () => void;
  onInterviewComplete: () => void;
}

interface DeepgramInterview {
  status: InterviewStatus;
  muted: boolean;
  paused: boolean;
  agentSpeaking: boolean;
  userSpeaking: boolean;
  elapsedSeconds: number;
  durationSeconds: number;
  sessionId: string | null;
  error: string | null;
  transcriptList: InterviewTranscript[];
  connectionRetryCount: number;
  maxConnectionRetries: number;
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
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptList, setTranscriptList] = useState<InterviewTranscript[]>([]);
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);

  const sessionRef = useRef<AgentSession | null>(null);
  const microphoneRef = useRef<AgentMicrophone | null>(null);
  const playerRef = useRef<AgentPlayer | null>(null);
  const callbacksRef = useRef(callbacks);
  const intentionalEndRef = useRef(false);
  const mutedRef = useRef(false);
  const pausedRef = useRef(false);
  const userSpeakingRef = useRef(false);
  const transcriptIdRef = useRef(0);
  const statusBeforePauseRef = useRef<InterviewStatus>('listening');
  const playbackMonitorRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const pauseStartedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const startNotificationSentRef = useRef(false);
  const wrapUpPromptSentRef = useRef(false);
  const endingMessageRequestedRef = useRef(false);
  const endingMessageSentRef = useRef(false);
  const endingTranscriptReceivedRef = useRef(false);
  const endingAudioStartedRef = useRef(false);
  const endingAudioDoneRef = useRef(false);  
  const endingAwaitingResponseRef = useRef(false);
  const endingResponseStartedRef = useRef(false);
  const completionSentRef = useRef(false);
  const closingSecondsRef = useRef(0);
  const connectionAttemptRef = useRef(0);
  const endingInjectionTimeoutRef = useRef<number | null>(null);
  const endingTurnTimeoutRef = useRef<number | null>(null);
  const endingPlaybackTimeoutRef = useRef<number | null>(null);

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
    if (endingInjectionTimeoutRef.current !== null) {
      window.clearTimeout(endingInjectionTimeoutRef.current);
      endingInjectionTimeoutRef.current = null;
    }
    if (endingTurnTimeoutRef.current !== null) {
      window.clearTimeout(endingTurnTimeoutRef.current);
      endingTurnTimeoutRef.current = null;
    }
    if (endingPlaybackTimeoutRef.current !== null) {
      window.clearTimeout(endingPlaybackTimeoutRef.current);
      endingPlaybackTimeoutRef.current = null;
    }
    sessionStartedAtRef.current = null;
    pauseStartedAtRef.current = null;
    totalPausedMsRef.current = 0;
    wrapUpPromptSentRef.current = false;
    endingMessageRequestedRef.current = false;
    endingMessageSentRef.current = false;
    endingTranscriptReceivedRef.current = false;
    endingAudioStartedRef.current = false;
    endingAudioDoneRef.current = false;
    endingAwaitingResponseRef.current = false;
    endingResponseStartedRef.current = false;
    completionSentRef.current = false;
    userSpeakingRef.current = false;
    microphoneRef.current?.stop();
    sessionRef.current?.disconnect();
    playerRef.current?.dispose();
    microphoneRef.current = null;
    sessionRef.current = null;
    playerRef.current = null;
  }, []);

  const end = useCallback((): void => {
    connectionAttemptRef.current += 1;
    intentionalEndRef.current = true;
    releaseResources();
    setMuted(false);
    setPaused(false);
    setAgentSpeaking(false);
    setUserSpeaking(false);
    setElapsedSeconds(0);
    setDurationSeconds(0);
    closingSecondsRef.current = 0;
    setConnectionRetryCount(0);
    mutedRef.current = false;
    pausedRef.current = false;
    setStatus('ended');
  }, [releaseResources]);

  const reset = useCallback((): void => {
    connectionAttemptRef.current += 1;
    intentionalEndRef.current = true;
    releaseResources();
    mutedRef.current = false;
    pausedRef.current = false;
    setMuted(false);
    setPaused(false);
    setAgentSpeaking(false);
    setUserSpeaking(false);
    setElapsedSeconds(0);
    setDurationSeconds(0);
    closingSecondsRef.current = 0;
    setConnectionRetryCount(0);
    setSessionId(null);
    setError(null);
    setTranscriptList([]);
    setStatus('idle');
  }, [releaseResources]);

  const start = useCallback(
    async ({
      interviewId,
      microphoneDeviceId,
      ...params
    }: InterviewStartParams): Promise<void> => {
      // This is the application's correlation ID for the complete interview lifecycle.
      // Deepgram's Welcome message does not always expose a session ID.
      const clientSessionId = crypto.randomUUID();
      const connectionAttempt = connectionAttemptRef.current + 1;
      connectionAttemptRef.current = connectionAttempt;
      const isCurrentAttempt = (): boolean => connectionAttemptRef.current === connectionAttempt;

      intentionalEndRef.current = false;
      releaseResources();
      setError(null);
      setMuted(false);
      setPaused(false);
      setAgentSpeaking(false);
      setUserSpeaking(false);
      setElapsedSeconds(0);
      setDurationSeconds(0);
      setConnectionRetryCount(0);
      setSessionId(clientSessionId);
      mutedRef.current = false;
      pausedRef.current = false;
      setTranscriptList([]);
      transcriptIdRef.current = 0;
      startNotificationSentRef.current = false;
      wrapUpPromptSentRef.current = false;
      endingMessageRequestedRef.current = false;
      endingMessageSentRef.current = false;
      endingTranscriptReceivedRef.current = false;
      endingAudioStartedRef.current = false;
      endingAudioDoneRef.current = false;
      endingAwaitingResponseRef.current = false;
      endingResponseStartedRef.current = false;
      completionSentRef.current = false;
      setStatus('connecting');

      try {
        const extensionToken = await fetchDeepgramToken();
        const agentBuild = await fetchAgentBuild(params, interviewId);
        if (!isCurrentAttempt()) return;
        if (agentBuild.closingSeconds >= agentBuild.durationSeconds) {
          throw new Error('closing_seconds must be less than duration_seconds.');
        }
        setDurationSeconds(agentBuild.durationSeconds);
        closingSecondsRef.current = agentBuild.closingSeconds;
        const inputSampleRate = agentBuild.audio?.input?.sampleRate ?? 16_000;
        const outputSampleRate = OPTIMIZED_OUTPUT_SAMPLE_RATE;
        const optimizedAudio = {
          ...agentBuild.audio,
          output: {
            ...agentBuild.audio?.output,
            encoding: 'mulaw' as const,
            sampleRate: outputSampleRate,
          },
        };

        const session = new AgentSession({
          auth: {
            // tokenFactory: extensionToken ? async () => extensionToken : fetchDeepgramToken,
            apiKey: extensionToken,
          },
          agent: agentBuild.agent,
          audio: optimizedAudio,
          tags: agentBuild.tags ?? ['mock-interview'],
          experimental: agentBuild.experimental,
          reconnect: {
            enabled: true,
            maxAttempts: MAX_CONNECTION_RETRIES,
          },
        });
        const player = new AgentPlayer({ sampleRate: outputSampleRate });
        const microphone = new AgentMicrophone((audio) => session.sendAudio(audio), {
          sampleRate: inputSampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });
        let connectionEstablished = false;       
        let agentAudioInProgress = false;
        let agentThinkingInProgress = false;
        let discardInterruptedAgentAudio = false;
        let initialGreetingPending = true;
        let initialGreetingStarted = false;
        let initialGreetingTimeout: number | null = null;
        let initialGreetingCompletionTimeout: number | null = null;
        let resolveInitialConnection: () => void = () => undefined;
        let rejectInitialConnection: (reason: Error) => void = () => undefined;
        const initialConnectionReady = new Promise<void>((resolve, reject) => {
          resolveInitialConnection = resolve;
          rejectInitialConnection = reject;
        });
        const clearInitialGreetingTimeout = (): void => {
          if (initialGreetingTimeout === null) return;
          window.clearTimeout(initialGreetingTimeout);
          initialGreetingTimeout = null;
        };

        const clearInitialGreetingCompletionTimeout = (): void => {
          if (initialGreetingCompletionTimeout === null) return;
          window.clearTimeout(initialGreetingCompletionTimeout);
          initialGreetingCompletionTimeout = null;
        };

        const markInitialGreetingStarted = (): void => {
          if (!initialGreetingPending || initialGreetingStarted) return;
          initialGreetingStarted = true;
          clearInitialGreetingTimeout();
          initialGreetingCompletionTimeout = window.setTimeout(
            () => {
              if (isCurrentAttempt()) finishInitialGreeting();
            },
            INITIAL_GREETING_COMPLETION_TIMEOUT_MS,
          );
        };
         const finishInitialGreeting = (): void => {
          if (!initialGreetingPending) return;
          initialGreetingPending = false;
          clearInitialGreetingTimeout();
          clearInitialGreetingCompletionTimeout();
          if (!mutedRef.current && !pausedRef.current) microphone.unmute();
        };
        sessionRef.current = session;
        playerRef.current = player;
        microphoneRef.current = microphone;

        const notifyStart = (): void => {
          if (!isCurrentAttempt()) return;
          if (startNotificationSentRef.current || !interviewId) return;

          if (!Number.isInteger(interviewId)) return;

          startNotificationSentRef.current = true;
          void notifyInterviewStarted(interviewId, clientSessionId).catch((notificationError) => {
            console.error('Interview start notification failed:', notificationError);
            handleRuntimeError(
              new Error(`Unable to start the interview: ${getErrorMessage(notificationError)}`),
            );
          });
        };

        const handleRuntimeError = (runtimeError: unknown): void => {
          if (!isCurrentAttempt()) return;
          // Initial connection failures are managed by AgentSession's typed
          // reconnecting/disconnected lifecycle below.
          if (!connectionEstablished) return;
          connectionAttemptRef.current += 1;
          intentionalEndRef.current = true;
          releaseResources();
          setMuted(false);
          setPaused(false);
          setAgentSpeaking(false);
          setUserSpeaking(false);
          mutedRef.current = false;
          pausedRef.current = false;
          setError(getErrorMessage(runtimeError));
          setStatus('error');
        };

        const stopPlaybackMonitor = (): void => {
          if (playbackMonitorRef.current !== null) {
            window.clearTimeout(playbackMonitorRef.current);
            playbackMonitorRef.current = null;
          }
        };

        const completeInterview = (): void => {
          if (completionSentRef.current || !isCurrentAttempt()) return;
          completionSentRef.current = true;
          callbacksRef.current.onInterviewComplete();
        };

        const injectEndingMessage = (force = false): void => {
          if (
            endingMessageSentRef.current ||
            (agentAudioInProgress && !force) ||
            session.state !== 'connected'
          )
            return;

          if (force && agentAudioInProgress) {
            player.interrupt();
            agentAudioInProgress = false;
            setAgentSpeaking(false);
          }
          if (endingInjectionTimeoutRef.current !== null) {
            window.clearTimeout(endingInjectionTimeoutRef.current);
            endingInjectionTimeoutRef.current = null;
          }
          userSpeakingRef.current = false;
          setUserSpeaking(false);
          endingMessageSentRef.current = true;
          endingTranscriptReceivedRef.current = false;
          endingAudioStartedRef.current = false;
          endingAudioDoneRef.current = false;
          if (endingTurnTimeoutRef.current !== null) {
            window.clearTimeout(endingTurnTimeoutRef.current);
            endingTurnTimeoutRef.current = null;
          }
          if (endingPlaybackTimeoutRef.current === null) {
            endingPlaybackTimeoutRef.current = window.setTimeout(
              completeInterview,
              ENDING_PLAYBACK_TIMEOUT_MS,
            );
          }
          session.injectAgentMessage(MOCK_INTERVIEW_ENDING_MESSAGE);          
        };

        const retryEndingInjection = (): void => {
          if (!isCurrentAttempt() || !endingMessageRequestedRef.current) return;
          endingMessageSentRef.current = false;
          endingTranscriptReceivedRef.current = false;
          endingAudioStartedRef.current = false;
          endingAudioDoneRef.current = false;
          if (endingInjectionTimeoutRef.current !== null) {
            window.clearTimeout(endingInjectionTimeoutRef.current);
          }
          endingInjectionTimeoutRef.current = window.setTimeout(
            () => injectEndingMessage(true),
            ENDING_INJECTION_RETRY_MS,
          );
        };

        const forceEndingMessage = (): void => {
          if (!isCurrentAttempt() || endingMessageSentRef.current) return;
          endingAwaitingResponseRef.current = false;
          endingResponseStartedRef.current = false;
          microphone.mute();
          userSpeakingRef.current = false;
          setUserSpeaking(false);
          injectEndingMessage(true);
        };

        const resumeWaitingForEndingTurn = (): void => {
          if (!isCurrentAttempt() || !endingMessageRequestedRef.current) return;
          endingMessageSentRef.current = false;
          endingTranscriptReceivedRef.current = false;
          endingAudioStartedRef.current = false;
          endingAudioDoneRef.current = false;
          endingAwaitingResponseRef.current = true;
          endingResponseStartedRef.current = false;
          userSpeakingRef.current = true;
          setUserSpeaking(true);
          if (endingInjectionTimeoutRef.current !== null) {
            window.clearTimeout(endingInjectionTimeoutRef.current);
            endingInjectionTimeoutRef.current = null;
          }
          if (endingPlaybackTimeoutRef.current !== null) {
            window.clearTimeout(endingPlaybackTimeoutRef.current);
            endingPlaybackTimeoutRef.current = null;
          }
          if (endingTurnTimeoutRef.current !== null) {
            window.clearTimeout(endingTurnTimeoutRef.current);
          }
          endingTurnTimeoutRef.current = window.setTimeout(
            forceEndingMessage,
            ENDING_TURN_TIMEOUT_MS,
          );
          if (!mutedRef.current && !pausedRef.current) microphone.unmute();
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
            if (initialGreetingPending && initialGreetingStarted) {
              finishInitialGreeting();
            }
            if (endingMessageRequestedRef.current && !endingMessageSentRef.current) {
              if (
                endingAwaitingResponseRef.current &&
                !endingResponseStartedRef.current
              ) {
                if (!pausedRef.current) setStatus('thinking');
                return;
              }
              endingAwaitingResponseRef.current = false;
              endingResponseStartedRef.current = false;
              injectEndingMessage();
              return;
            }
            if (
              endingMessageSentRef.current &&
              endingTranscriptReceivedRef.current &&
              endingAudioStartedRef.current &&
              endingAudioDoneRef.current &&
              !completionSentRef.current
            ) {
              completionSentRef.current = true;
              callbacksRef.current.onInterviewComplete();
              return;
            }
            
            if (!pausedRef.current) setStatus('listening');
          };

          playbackMonitorRef.current = window.setTimeout(checkPlayback, 60);
        };

        session.on('audio', (chunk) => {
          if (!isCurrentAttempt()) return;
          if (discardInterruptedAgentAudio && !endingMessageSentRef.current) return;
          agentThinkingInProgress = false;
          markInitialGreetingStarted();
          if (endingAwaitingResponseRef.current && !endingMessageSentRef.current) {
            endingResponseStartedRef.current = true;
          }
          agentAudioInProgress = true;
          if (endingMessageSentRef.current) {
            endingAudioStartedRef.current = true;
          }
          player.queue(decodeMuLaw(chunk));

          stopPlaybackMonitor();
          userSpeakingRef.current = false;
          setAgentSpeaking(true);
          setUserSpeaking(false);
          if (!pausedRef.current) {
            setStatus('speaking');
            callbacksRef.current.onAgentSpeaking();
          }
        });
        session.on('settings-applied', () => {
          if (!isCurrentAttempt()) return;
          setUserSpeaking(false);
          notifyStart();
          initialGreetingTimeout = window.setTimeout(() => {
            if (!isCurrentAttempt() || initialGreetingStarted) return;
            finishInitialGreeting();
          }, INITIAL_GREETING_START_TIMEOUT_MS);
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
              const activeSeconds = Math.max(0, Math.floor(activeMs / 1000));

              if (
                activeSeconds >= closingSecondsRef.current &&
                !wrapUpPromptSentRef.current &&
                session.state === 'connected'
              ) {
                wrapUpPromptSentRef.current = true;
                session.updatePrompt(MOCK_INTERVIEW_CLOSING_PROMPT);
              }

              if (
                activeSeconds >= agentBuild.durationSeconds &&
                !endingMessageRequestedRef.current &&
                session.state === 'connected'
              ) {
                endingMessageRequestedRef.current = true;
                endingTurnTimeoutRef.current = window.setTimeout(
                  forceEndingMessage,
                  ENDING_TURN_TIMEOUT_MS,
                );

                if (userSpeakingRef.current || agentThinkingInProgress) {
                  // Let Deepgram finish the active user turn and produce its
                  // normal response before the final interview message.
                  endingAwaitingResponseRef.current = true;
                  endingResponseStartedRef.current = false;
                  if (!userSpeakingRef.current) microphone.mute();
                } else {
                  microphone.mute();
                  if (!agentAudioInProgress) injectEndingMessage();
                }
              }

              setElapsedSeconds(Math.min(activeSeconds, agentBuild.durationSeconds));
            }, 250);
          }
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('conversation-text', (message: ConversationTextMessage) => {
          if (!isCurrentAttempt()) return;
          const content = message.content?.trim();
          if (!content) return;

          const role = message.role === 'agent' ? 'assistant' : message.role;
          if (role !== 'user' && role !== 'assistant') return;
          if (role === 'assistant' && content === MOCK_INTERVIEW_ENDING_MESSAGE) {
            endingTranscriptReceivedRef.current = true;
          }
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
          if (!isCurrentAttempt()) return;
          if (initialGreetingPending) return;
          if (
            endingMessageRequestedRef.current &&
            !endingAwaitingResponseRef.current
          ) {
            if (!endingAudioStartedRef.current) resumeWaitingForEndingTurn();
            return;
          }
          agentThinkingInProgress = false;
          discardInterruptedAgentAudio = agentAudioInProgress;
          userSpeakingRef.current = true;
          player.interrupt();
          stopPlaybackMonitor();
          setAgentSpeaking(false);
          setUserSpeaking(true);
          if (pausedRef.current) return;
          setStatus('listening');
          callbacksRef.current.onReady();
        });
        session.on('agent-thinking', () => {
          if (!isCurrentAttempt()) return;
          agentThinkingInProgress = true;
          discardInterruptedAgentAudio = false;
          userSpeakingRef.current = false;
          setUserSpeaking(false);
          if (endingAwaitingResponseRef.current) {
            // The active user turn is complete. Block a new user turn while
            // Deepgram prepares and speaks the response we are waiting for.
            microphone.mute();
          }
          if (pausedRef.current) return;
          setStatus('thinking');
          callbacksRef.current.onThinking();
        });
        session.on('agent-started-speaking', () => {
          if (!isCurrentAttempt()) return;
          agentThinkingInProgress = false;
          discardInterruptedAgentAudio = false;
          // Some Deepgram configurations transition directly from the user
          // turn to agent speech without emitting AgentThinking first.
          // AgentStartedSpeaking therefore also definitively closes the user
          // turn and allows the new response audio through the stale-audio guard.
          userSpeakingRef.current = false;
          markInitialGreetingStarted();
          if (endingAwaitingResponseRef.current && !endingMessageSentRef.current) {
            endingResponseStartedRef.current = true;
          }
          agentAudioInProgress = true;
          if (endingMessageSentRef.current) {
            endingAudioStartedRef.current = true;
          }
          setUserSpeaking(false);
          if (pausedRef.current) return;
          setAgentSpeaking(true);
          setStatus('speaking');
          callbacksRef.current.onAgentSpeaking();
        });
        session.on('agent-audio-done', () => {
          if (!isCurrentAttempt()) return;
          agentAudioInProgress = false;
          discardInterruptedAgentAudio = false;
          if (endingAudioStartedRef.current) endingAudioDoneRef.current = true;
          waitForPlaybackToFinish();
        });
        session.on('injection-refused', () => {
          retryEndingInjection();
        });
        session.on('warning', (message) => {
          if (message.code === 'INJECT_AGENT_MESSAGE_DURING_USER_SPEECH') {
            resumeWaitingForEndingTurn();
          } else if (message.code === 'INJECT_AGENT_MESSAGE_DURING_AGENT_SPEECH') {
            retryEndingInjection();
          }
        });
        session.on('connected', () => {
          if (!isCurrentAttempt()) return;
          connectionEstablished = true;
          resolveInitialConnection();
        });
        session.on('reconnecting', (attempt) => {
          if (!isCurrentAttempt()) return;
          if (!connectionEstablished) setConnectionRetryCount(attempt);
          setStatus('connecting');
        });
        session.on('disconnected', (reason) => {
          if (!connectionEstablished) {
            rejectInitialConnection(new Error(reason || 'Unable to connect to Deepgram.'));
          }
          if (!isCurrentAttempt()) return;
          if (intentionalEndRef.current) return;
          setUserSpeaking(false);
          setError(
            endingMessageRequestedRef.current
              ? 'The voice session disconnected before the interview could finish.'
              : reason || 'The voice session disconnected.',
          );
          setStatus('error');
        });
        session.on('error', (message) => {
          handleRuntimeError(new Error(message.description ?? 'Deepgram reported an agent error.'));
        });
        session.on('sdk-error', handleRuntimeError);
        microphone.on('error', handleRuntimeError);

        await session.connect();
        await initialConnectionReady;
        if (!isCurrentAttempt()) {
          session.disconnect();
          player.dispose();
          return;
        }
        // Do not send microphone startup frames while the initial greeting is
        // playing. Chrome's input processing can emit a short transient while
        // echo cancellation and automatic gain control settle, which Deepgram
        // may otherwise interpret as an interruption.
        microphone.mute();
        await startAgentMicrophoneWithDevice(microphone, microphoneDeviceId);
      } catch (startError) {
        if (!isCurrentAttempt()) return;
        intentionalEndRef.current = true;
        releaseResources();
        setDurationSeconds(0);
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

  useEffect(
    () => () => {
      connectionAttemptRef.current += 1;
      releaseResources();
    },
    [releaseResources],
  );

  return {
    status,
    muted,
    paused,
    agentSpeaking,
    userSpeaking,
    elapsedSeconds,
    durationSeconds,
    sessionId,
    error,
    transcriptList,
    connectionRetryCount,
    maxConnectionRetries: MAX_CONNECTION_RETRIES,
    start,
    end,
    reset,
    toggleMute,
    togglePause,
  };
}
