import React, { useEffect, useState } from 'react';

import { AgentMicrophone, AgentPlayer, AgentSession } from '@deepgram/agents';

import { screenDefinitions } from 'components/Interview/screenDefinitions';
import { ConnectingScreen } from 'components/Interview/screens/ConnectingScreen';
import { FinishedScreen } from 'components/Interview/screens/FinishedScreen';
import { HomeScreen } from 'components/Interview/screens/HomeScreen';
import { LiveScreen } from 'components/Interview/screens/LiveScreen';
import { ReportScreen } from 'components/Interview/screens/ReportScreen';
import { ThinkingScreen } from 'components/Interview/screens/ThinkingScreen';
import { Screen, Theme } from 'components/Interview/types';

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('ntro-theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });

  useEffect(() => {
    window.localStorage.setItem('ntro-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const fetchToken = async (): Promise<string> => {
    return fetch('http://test.ntro.io/account/get_dg_token', {
      method: 'post',
    }).then((response) => response.json());
  };

  const screenViews: Record<Screen, JSX.Element> = {
    home: <HomeScreen onStart={() => setScreen('connecting')} />,
    connecting: <ConnectingScreen onConnected={() => setScreen('live')} />,
    live: <LiveScreen onEnd={() => setScreen('finished')} />,
    //  thinking: (
    //    <ThinkingScreen onContinue={() => setScreen('live')} onEnd={() => setScreen('finished')} />
    //  ),
    finished: <FinishedScreen onAgain={() => setScreen('home')} />,
    //  report: <ReportScreen onAgain={() => setScreen('home')} />,
  };

  return (
    <main className={`app-shell theme--${theme}`}>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      {/* <nav className="stage-nav" aria-label="Preview interview screens">
        {screenDefinitions.map((item, index) => (
          <button
            key={item.id}
            className={screen === item.id ? 'active' : ''}
            onClick={() => setScreen(item.id)}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </nav> */}

      {screenViews[screen]}
    </main>
  );
}
