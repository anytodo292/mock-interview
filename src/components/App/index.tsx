import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ConnectingScreen } from 'components/Interview/screens/ConnectingScreen';
import { FinishedScreen } from 'components/Interview/screens/FinishedScreen';
import { HomeScreen } from 'components/Interview/screens/HomeScreen';
import { InvalidInterviewScreen } from 'components/Interview/screens/InvalidInterviewScreen';
import { InstallExtensionScreen } from 'components/Interview/screens/InstallExtensionScreen';
import { LiveScreen } from 'components/Interview/screens/LiveScreen';
import { ReportScreen } from 'components/Interview/screens/ReportScreen';
import { ThinkingScreen } from 'components/Interview/screens/ThinkingScreen';
import { ThemeProvider } from 'components/Interview/shared/ThemeContext';
import { MockInterviewParams, Screen, Theme } from 'components/Interview/types';
import { useDeepgramInterview } from '../../hooks/useDeepgramInterview';
import { DifficultyType, getInterviewerInfo, LangType } from '@/constants';
import { fetchInterview } from '../../services/deepgramApi';
import { IInterview } from '@/types';

export default function App(): JSX.Element {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const fromExtension = search.get('from') === 'extension';
  const interviewId = search.get('li_id');
  const msId = search.get('ms_id');
  const hasInterviewQuery = fromExtension && Boolean(interviewId) && Boolean(msId);

  const extensionStartedRef = useRef(false);

  const [screen, setScreen] = useState<Screen>(hasInterviewQuery ? 'connecting' : 'invalid');
  const [selectedLanguage, setSelectedLanguage] = useState<number>(LangType.ENGLISH);
  const [extensionParams, setExtensionParams] = useState<MockInterviewParams | null>(null);
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
    setSelectedLanguage(params.language);
    setScreen('connecting');
    void interview
      .start({
        ...params,
        ...(fromExtension && interviewId ? { interviewId } : {}),
      })
      .catch(() => {
        // The hook exposes a user-facing error and owns resource cleanup.
      });
  };

  const endInterview = (): void => {
    interview.end();
    setScreen('finished');
  };

  const restartInterview = (): void => {
    interview.reset();
    setScreen('home');
  };

  const latestAgentMessage = interview.transcript
    .filter(({ role }) => role === 'assistant' || role === 'agent')
    .slice(-1)[0]?.content;
  const interviewer = getInterviewerInfo(selectedLanguage);

  const screenViews: Record<Screen, JSX.Element> = {
    home: (
      <HomeScreen
        onStart={startInterview}
        initialParams={extensionParams ?? undefined}
        lockInterview={fromExtension}
      />
    ),
    connecting: <ConnectingScreen interviewer={interviewer} />,
    live: (
      <LiveScreen
        interviewer={interviewer}
        onEnd={endInterview}
        muted={interview.muted}
        paused={interview.paused}
        agentSpeaking={interview.agentSpeaking}
        agentMessage={latestAgentMessage}
        onMute={interview.toggleMute}
        onPause={interview.togglePause}
      />
    ),
    thinking: (
      <ThinkingScreen
        interviewer={interviewer}
        onEnd={endInterview}
        muted={interview.muted}
        paused={interview.paused}
        onMute={interview.toggleMute}
        onPause={interview.togglePause}
      />
    ),
    finished: <FinishedScreen onAgain={restartInterview} />,
    report: <ReportScreen onAgain={restartInterview} />,
    invalid: <InvalidInterviewScreen />,
    'install-extension': <InstallExtensionScreen extensionId={__EXTENSION_ID__} />,
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
