import React from 'react';

import { CallControls } from '../shared/CallControls';
import { interviewer, InterviewerIdentity } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';

interface ThinkingScreenProps {
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  onMute: () => void;
  onPause: () => void;
}

export function ThinkingScreen({
  onEnd,
  muted,
  paused,
  onMute,
  onPause,
}: ThinkingScreenProps): JSX.Element {
  return (
    <section
      className={`screen screen--dark interview-screen ${paused ? 'interview-screen--paused' : ''}`}
    >
      <TopBar dark />
      <div className="interview-layout">
        <div className="video-column">
          <InterviewerIdentity time="12:15" />
          <div className="video-frame video-frame--thinking">
            <img src={interviewer} alt="Emma considering the answer" />
            <div className="speaking">
              <span className="thinking-dot" /> AI thinking
            </div>
          </div>
        </div>

        <div className="thinking-panel">
          <span className="eyebrow eyebrow--dark">
            {paused ? 'Interview paused' : 'Response received'}
          </span>
          <h1>{paused ? 'Take a moment.' : 'Analyzing your answer...'}</h1>
          <p>
            {paused
              ? 'Your interview is paused. Resume whenever you are ready.'
              : 'Emma is reviewing the clarity, structure and technical depth of your response.'}
          </p>
          <div className="brain">
            <span>{paused ? 'Ⅱ' : '⌘'}</span>
          </div>
          <div className="analysis-lines">
            <i />
            <i />
            <i />
          </div>
          <CallControls
            onEnd={onEnd}
            muted={muted}
            paused={paused}
            onMute={onMute}
            onPause={onPause}
          />
        </div>
      </div>
    </section>
  );
}
