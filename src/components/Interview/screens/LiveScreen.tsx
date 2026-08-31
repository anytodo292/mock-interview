import React, { useState } from 'react';

import { CallControls } from '../shared/CallControls';
import { interviewer, InterviewerIdentity, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';

interface LiveScreenProps {
  onThinking?: () => void;
  onEnd: () => void;
}

export function LiveScreen({ onThinking, onEnd }: LiveScreenProps): JSX.Element {
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  return (
    <section
      className={`screen screen--dark interview-screen ${paused ? 'interview-screen--paused' : ''}`}
    >
      <TopBar dark />
      <div className="interview-layout">
        <div className="video-column">
          <InterviewerIdentity />
          <div className="video-frame">
            <img src={interviewer} alt="Emma speaking" />
            <div className="speaking">
              <Waveform green /> Speaking
            </div>
          </div>
        </div>

        <div className="conversation-column">
          <div>
            <span className="live-label">
              <i /> Live interview
            </span>
            <h1>Let&apos;s talk about your experience.</h1>
            <p className="question">
              Tell me about yourself and your experience in backend development.
            </p>
          </div>

          <div className={`listening-card ${muted || paused ? 'listening-card--inactive' : ''}`}>
            <div>
              <span className="mic">&#9833;</span>
              <strong>{paused ? 'Paused' : muted ? 'Microphone muted' : 'Listening...'}</strong>
            </div>
            <Waveform />
          </div>

          <p className="hint">Take your time. Emma will listen until you finish your answer.</p>
          <button className="answer-button" onClick={onThinking} disabled={paused}>
            I&apos;ve finished my answer <span>&rarr;</span>
          </button>
          <CallControls
            onEnd={onEnd}
            muted={muted}
            paused={paused}
            onMute={() => setMuted((value) => !value)}
            onPause={() => setPaused((value) => !value)}
          />
        </div>
      </div>
    </section>
  );
}
