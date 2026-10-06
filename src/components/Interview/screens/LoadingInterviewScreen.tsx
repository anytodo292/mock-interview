import React from 'react';

import { TopBar } from '../shared/TopBar';
import { useTheme } from '../shared/ThemeContext';

export function LoadingInterviewScreen(): JSX.Element {
  const { theme } = useTheme();
  
  return (
    <section className={`screen screen--${theme} loading-interview-screen`}>
      <TopBar />
      <div className="loading-interview" role="status" aria-live="polite">
        <div className="loading-interview__spinner" aria-hidden="true" />
        <span className="eyebrow">Preparing your session</span>
        <h1>Loading interview...</h1>
        <p>We&apos;re securely checking your interview details.</p>
      </div>
    </section>
  );
}
