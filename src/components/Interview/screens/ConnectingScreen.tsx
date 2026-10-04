import React, { useState } from 'react';

import { Avatar, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { useTheme } from '../shared/ThemeContext';
import { Interviewer } from '@/constants';

interface ConnectingScreenProps {
  interviewer: Interviewer;
  retryCount: number;
  maxRetries: number;
}

export function ConnectingScreen({
  interviewer,
  retryCount,
  maxRetries,
}: ConnectingScreenProps): JSX.Element {
  const { theme } = useTheme();

  const retrying = retryCount > 0;

  return (
    <section className={`screen screen--${theme} connecting-screen`}>
      <TopBar dark />
      <div className="connecting-content">
        <span className="eyebrow eyebrow--dark">Secure session</span>
        <h1>
          Connecting<span className="animated-dots">...</span>
        </h1>
        <p>
          {retrying
            ? `The connection timed out. Retrying...`// ${retryCount} of ${maxRetries}
            : 'Please wait while we connect you to your AI interviewer.'}
        </p>
        <div className="connection-orbit">
          <Waveform />
          <Avatar interviewer={interviewer} />
        </div>
        {/* <h2>
          {interviewer.name} is joining<span className="animated-dots">...</span>
        </h2> */}
        <div className="loading-dots">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="secure-note">
        <span>&#9830;</span>
        <div>
          <strong>Your data is secure</strong>
          <small>This conversation is private and not shared.</small>
        </div>
      </div>
    </section>
  );
}
