import React from 'react';

import { CallControls } from '../shared/CallControls';
import { InterviewerIdentity, SpeakingPortrait, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { Interviewer } from '@/constants';
import { IInterview } from '@/types';

interface LiveScreenProps {
  interviewer: Interviewer;
  interviewInfo?: IInterview;
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  agentSpeaking: boolean;
  userSpeaking: boolean;
  elapsedSeconds: number;
  controlsDisabled?: boolean;
  agentMessage?: string;
  onMute: () => void;
  onPause: () => void;
}

export function LiveScreen({
  interviewer,
  interviewInfo,
  onEnd,
  muted,
  paused,
  agentSpeaking,
  userSpeaking,
  elapsedSeconds,
  controlsDisabled = false,
  agentMessage,
  onMute,
  onPause,
}: LiveScreenProps): JSX.Element {
  const someoneSpeaking = agentSpeaking || userSpeaking;
  const activityInactive = paused || (muted && !agentSpeaking);

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
          <div className="video-frame">
            <SpeakingPortrait interviewer={interviewer} isSpeaking={agentSpeaking && !paused} />
            <div className="speaking">
              <Waveform green /> {agentSpeaking ? 'Speaking' : 'Ready'}
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
              {agentMessage ??
                `${interviewer.name} is ready. Say hello to begin your mock interview.`}
            </p>
          </div>

          <div
            className={`listening-card ${activityInactive ? 'listening-card--inactive' : ''} ${!someoneSpeaking ? 'listening-card--idle' : ''}`}
            role="status"
            aria-live="polite"
          >
            <div>
              <span className="mic">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M8 14.5V5.8l7-1.5v8.2M8 8l7-1.5M8 14.5c0 1.1-1.1 2-2.5 2S3 15.6 3 14.5s1.1-2 2.5-2 2.5.9 2.5 2Zm7-2c0 1.1-1.1 2-2.5 2s-2.5-.9-2.5-2 1.1-2 2.5-2 2.5.9 2.5 2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <strong>
                {paused
                  ? 'Interview paused'
                  : agentSpeaking
                    ? `${interviewer.name} is speaking`
                    : muted
                      ? 'Your microphone is muted'
                      : userSpeaking
                        ? 'You are speaking'
                        : 'Ready — you can speak'}
              </strong>
            </div>
            <Waveform />
          </div>

          <p className="hint">
            Take your time. {interviewer.name} will listen until you finish your answer.
          </p>
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
