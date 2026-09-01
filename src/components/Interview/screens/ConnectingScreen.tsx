import React, { useState } from 'react';

import { Avatar, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { InterviewerInfo } from '@/constants';

export function ConnectingScreen(): JSX.Element {
  return (
    <section className="screen screen--dark connecting-screen">
      <TopBar dark />
      <div className="connecting-content">
        <span className="eyebrow eyebrow--dark">Secure session</span>
        <h1>
          Connecting<span className="animated-dots">...</span>
        </h1>
        <p>Please wait while we connect you to your AI interviewer.</p>
        <div className="connection-orbit">
          <Waveform />
          <Avatar />
        </div>
        <h2>
          {InterviewerInfo[0].name} is joining<span className="animated-dots">...</span>
        </h2>
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
