import React from 'react';

import { CallControls } from '../shared/CallControls';
import { InterviewerIdentity } from '../shared/InterviewVisuals';
import { Interviewer } from '@/constants';
import { IInterview } from '@/types';
import { TopBar } from '../shared/TopBar';

interface ThinkingScreenProps {
  interviewer: Interviewer;
  interviewInfo?: IInterview;
  elapsedSeconds: number;
  controlsDisabled?: boolean;
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  onMute: () => void;
  onPause: () => void;
}

export function ThinkingScreen({
  interviewer,
  interviewInfo,
  elapsedSeconds,
  controlsDisabled = false,
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
          <InterviewerIdentity
            interviewer={interviewer}
            interviewInfo={interviewInfo}
            elapsedSeconds={elapsedSeconds}
          />
          <div className="video-frame video-frame--thinking">
            <img src={interviewer.image} alt={`${interviewer.name} considering the answer`} />
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
              : `${interviewer.name} is reviewing the clarity, structure and technical depth of your response.`}
          </p>
          <div className="brain">
            <span aria-hidden="true">
              {paused ? (
                <svg viewBox="0 0 32 32">
                  <path
                    d="M10 7v18M22 7v18"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 32 32">
                  <path
                    d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="16" r="2" fill="currentColor" />
                </svg>
              )}
            </span>
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
            disabled={controlsDisabled}
            onMute={onMute}
            onPause={onPause}
          />
        </div>
      </div>
    </section>
  );
}
