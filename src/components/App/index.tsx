import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ConnectingScreen } from 'components/Interview/screens/ConnectingScreen';
import { FinishedScreen } from 'components/Interview/screens/FinishedScreen';
import { HomeScreen } from 'components/Interview/screens/HomeScreen';
import { InvalidInterviewScreen } from 'components/Interview/screens/InvalidInterviewScreen';
import { InstallExtensionScreen } from 'components/Interview/screens/InstallExtensionScreen';
import { LoadingInterviewScreen } from 'components/Interview/screens/LoadingInterviewScreen';
import { LiveScreen } from 'components/Interview/screens/LiveScreen';
import { ReportScreen } from 'components/Interview/screens/ReportScreen';
import { ThinkingScreen } from 'components/Interview/screens/ThinkingScreen';
import { ThemeProvider } from 'components/Interview/shared/ThemeContext';
import {
  InterviewTranscript,
  InterviewEvaluation,
  FinishedInterview,
  MockInterviewParams,
  Screen,
  Theme,
} from 'components/Interview/types';
import { useDeepgramInterview } from '../../hooks/useDeepgramInterview';
import { DifficultyType, getInterviewerInfo, LangType } from '@/constants';
import {
  fetchEvaluation,
  fetchInterview,
  finishInterview,
  uploadTranscript,
} from '../../services/deepgramApi';
import { IInterview } from '@/types';

export default function App(): JSX.Element {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const fromExtension = search.get('from') === 'extension';
  const interviewId = Number(search.get('li_id'));
  const msId = String(search.get('ms_id'));
  const hasInterviewQuery = fromExtension && Boolean(interviewId) && Boolean(msId);

  const extensionStartedRef = useRef(false);

  const [screen, setScreen] = useState<Screen>(hasInterviewQuery ? 'loading' : 'invalid');
  const [interviewInfo, setInterviewInfo] = useState<IInterview>();
  const [selectedLanguage, setSelectedLanguage] = useState<number>(LangType.ENGLISH);
  const [extensionParams, setExtensionParams] = useState<MockInterviewParams | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [finishedInterview, setFinishedInterview] = useState<FinishedInterview | null>(null);
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(
    fromExtension ? null : true,
  );

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('ntro-theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });

  const interview = useDeepgramInterview({
    onReady: () => setScreen('live'),
    onThinking: () => setScreen('thinking'),
    onAgentSpeaking: () => setScreen('live'),
  });
  const transcriptRef = useRef<InterviewTranscript[]>([]);
  const lastUploadedIndexRef = useRef(0);
  const transcriptUploadInFlightRef = useRef(false);

  useEffect(() => {
    transcriptRef.current = interview.transcriptList;
  }, [interview.transcriptList]);

  const uploadPendingTranscripts = useCallback(async (): Promise<void> => {
    if (
      !Number.isInteger(interviewId) ||
      !interview.sessionId ||
      transcriptUploadInFlightRef.current
    )
      return;

    const startIndex = lastUploadedIndexRef.current;
    const pendingTranscript = transcriptRef.current.slice(startIndex);
    if (pendingTranscript.length === 0) return;

    transcriptUploadInFlightRef.current = true;
    try {
      const ret = await uploadTranscript(interviewId, interview.sessionId, pendingTranscript);
      if (ret.added) {
        lastUploadedIndexRef.current = startIndex + pendingTranscript.length;
      }
    } catch (uploadError) {
      console.error('Transcript upload failed:', uploadError);
    } finally {
      transcriptUploadInFlightRef.current = false;
    }
  }, [interview.sessionId, interviewId]);

  useEffect(() => {
    if (!interviewId || !interview.sessionId) return;

    const uploadTimer = window.setInterval(() => {
      void uploadPendingTranscripts();
    }, 10000);

    return () => window.clearInterval(uploadTimer);
  }, [interview.sessionId, interviewId, uploadPendingTranscripts]);

  useEffect(() => {
    window.localStorage.setItem('ntro-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!hasInterviewQuery || extensionInstalled !== true || extensionStartedRef.current) return;
    extensionStartedRef.current = true;

    if (!msId || !interviewId) {
      setScreen('invalid');
      return;
    }

    void fetchInterview(msId, interviewId).then(
      (record: IInterview | null) => {
        if (!record) {
          setScreen('invalid');
          return;
        }
        setInterviewInfo(record);
        setExtensionParams({
          language: record.lang,
          scenario: record.scenario,
          difficulty: DifficultyType.Mid,
        });
        setSelectedLanguage(record.lang);
        setScreen('home');
      },
      () => {
        setScreen('invalid');
      },
    );
  }, [extensionInstalled, hasInterviewQuery, interviewId, msId]);

  useEffect(() => {
    if (!hasInterviewQuery) return;

    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage || !__EXTENSION_ID__) {
      setExtensionInstalled(false);
      setScreen('install-extension');
      return;
    }

    chrome.runtime.sendMessage(
      __EXTENSION_ID__,
      { type: 'CHECK_NTRO_EXTENSION' },
      (response: any) => {
        if (chrome.runtime.lastError) {
          console.error('Extension communication failed:', chrome.runtime.lastError.message);
          setExtensionInstalled(false);
          setScreen('install-extension');
          return;
        }

        const installed = response?.installed === true;
        setExtensionInstalled(installed);
        if (!installed) setScreen('install-extension');
      },
    );
  }, [hasInterviewQuery]);

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const startInterview = (params: MockInterviewParams): void => {
    transcriptRef.current = [];
    lastUploadedIndexRef.current = 0;
    setEvaluation(null);
    setEvaluationError(null);
    setFinishedInterview(null);
    setFinishError(null);
    setSelectedLanguage(params.language);
    setScreen('connecting');
    void interview
      .start({
        ...params,
        ...{ interviewId },
        ...{ msId }
      })
      .catch(() => {
        // The hook exposes a user-facing error and owns resource cleanup.
      });
  };

  const loadFinishedInterview = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(interviewId) || !interview.sessionId) {
      setFinishError('The interview session information is unavailable.');
      return;
    }

    setFinishLoading(true);
    setFinishError(null);
    try {
      await uploadPendingTranscripts();
      const result = await finishInterview(interviewId, interview.sessionId);
      setFinishedInterview(result);
    } catch (finishRequestError) {
      setFinishError(
        finishRequestError instanceof Error
          ? finishRequestError.message
          : 'Unable to finish the interview.',
      );
    } finally {
      setFinishLoading(false);
    }
  }, [interview.sessionId, interviewId, uploadPendingTranscripts]);

  const endInterview = (): void => {
    interview.end();
    setScreen('finished');
    void loadFinishedInterview();
  };

  const restartInterview = (): void => {
    interview.reset();
    setEvaluation(null);
    setEvaluationError(null);
    setFinishedInterview(null);
    setFinishError(null);
    setScreen('home');
  };

  const loadEvaluation = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(interviewId) || !interview.sessionId) {
      setEvaluationError('The interview session information is unavailable.');
      return;
    }

    setEvaluationLoading(true);
    setEvaluationError(null);
    try {
      await uploadPendingTranscripts();
      const report = await fetchEvaluation(interviewId, interview.sessionId);
      setEvaluation(report);
    } catch (evaluationRequestError) {
      setEvaluationError(
        evaluationRequestError instanceof Error
          ? evaluationRequestError.message
          : 'Unable to load the evaluation report.',
      );
    } finally {
      setEvaluationLoading(false);
    }
  }, [interview.sessionId, interviewId, uploadPendingTranscripts]);

  const viewReport = (): void => {
    setScreen('report');
    if (!evaluation && !evaluationLoading) void loadEvaluation();
  };

  const latestAgentMessage = interview.transcriptList
    .filter(({ speaker }) => speaker === 'interviewer')
    .slice(-1)[0]?.talk;
  const interviewer = getInterviewerInfo(selectedLanguage);

  const screenViews: Record<Screen, JSX.Element> = {
    home: (
      <HomeScreen
        onStart={startInterview}
        interviewInfo={interviewInfo}
        initialParams={extensionParams ?? undefined}
        lockInterview={fromExtension}
      />
    ),
    connecting: <ConnectingScreen interviewer={interviewer} />,
    live: (
      <LiveScreen
        interviewer={interviewer}
        interviewInfo={interviewInfo}
        onEnd={endInterview}
        muted={interview.muted}
        paused={interview.paused}
        agentSpeaking={interview.agentSpeaking}
        userSpeaking={interview.userSpeaking}
        elapsedSeconds={interview.elapsedSeconds}
        agentMessage={latestAgentMessage}
        onMute={interview.toggleMute}
        onPause={interview.togglePause}
      />
    ),
    thinking: (
      <ThinkingScreen
        interviewer={interviewer}
        interviewInfo={interviewInfo}
        elapsedSeconds={interview.elapsedSeconds}
        onEnd={endInterview}
        muted={interview.muted}
        paused={interview.paused}
        onMute={interview.toggleMute}
        onPause={interview.togglePause}
      />
    ),
    finished: (
      <FinishedScreen
        result={finishedInterview}
        loading={finishLoading}
        error={finishError}
        onRetry={() => void loadFinishedInterview()}
        onReport={viewReport}
        onAgain={restartInterview}
      />
    ),
    report: (
      <ReportScreen
        evaluation={evaluation}
        loading={evaluationLoading}
        error={evaluationError}
        onRetry={() => void loadEvaluation()}
        onAgain={restartInterview}
      />
    ),
    invalid: <InvalidInterviewScreen />,
    'install-extension': <InstallExtensionScreen extensionId={__EXTENSION_ID__} />,
    loading: <LoadingInterviewScreen />,
  };

  return (
    <main className={`app-shell theme--${theme}`}>
      <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
        {interview.error && (
          <div className="session-error" role="alert">
            <strong>Interview connection failed</strong>
            <span>{interview.error}</span>
            <button type="button" onClick={restartInterview}>
              Return home
            </button>
          </div>
        )}

        {screenViews[screen]}
      </ThemeProvider>
    </main>
  );
}
