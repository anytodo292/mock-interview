import React, { useEffect, useState } from 'react';

import { ConnectingScreen } from 'components/Interview/screens/ConnectingScreen';
import { FinishedScreen } from 'components/Interview/screens/FinishedScreen';
import { HomeScreen } from 'components/Interview/screens/HomeScreen';
import { LiveScreen } from 'components/Interview/screens/LiveScreen';
import { ReportScreen } from 'components/Interview/screens/ReportScreen';
import { ThinkingScreen } from 'components/Interview/screens/ThinkingScreen';
import { ThemeProvider } from 'components/Interview/shared/ThemeContext';
import { MockInterviewParams, Screen, Theme } from 'components/Interview/types';
import { useDeepgramInterview } from '../../hooks/useDeepgramInterview';
import { getInterviewerInfo, LangType } from '@/constants';

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<number>(LangType.ENGLISH);
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

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const startInterview = (params: MockInterviewParams): void => {
    setSelectedLanguage(params.language);
    setScreen('connecting');
    void interview.start(params).catch(() => {
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
    home: <HomeScreen onStart={startInterview} />,
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
