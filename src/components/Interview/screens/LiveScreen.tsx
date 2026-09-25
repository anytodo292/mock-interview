import React from 'react';

import { CallControls } from '../shared/CallControls';
import { InterviewerIdentity, SpeakingPortrait, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { useTheme } from '../shared/ThemeContext';
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
  runtimeError?: boolean;
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
  runtimeError = false,
  agentMessage,
  onMute,
  onPause,
}: LiveScreenProps): JSX.Element {
  const someoneSpeaking = agentSpeaking || userSpeaking;
  const activityInactive = paused || (muted && !agentSpeaking);
  
  const { theme } = useTheme();

  return (
    <section
      className={`screen screen--${theme} interview-screen ${paused ? 'interview-screen--paused' : ''}`}
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
            <SpeakingPortrait
              interviewer={interviewer}
              isSpeaking={agentSpeaking && !paused}
              staticImage={runtimeError}
            />
            {/* <div className="speaking">
              <Waveform green /> {agentSpeaking ? 'Speaking' : 'Ready'}
            </div> */}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                  <path d="M0 0h16v16H0z" fill="none" />
                  <path fill="currentColor" d="M13.401 1.058a.5.5 0 0 1 .676.208A8 8 0 0 1 15 5a8 8 0 0 1-.923 3.734a.5.5 0 1 1-.884-.468A7 7 0 0 0 14 5c0-1.18-.292-2.292-.807-3.266a.5.5 0 0 1 .208-.676M5 5a2 2 0 1 1 4 0a2 2 0 0 1-4 0m2-3a3 3 0 1 0 0 6a3 3 0 0 0 0-6m5 8.5A1.5 1.5 0 0 0 10.5 9h-7A1.5 1.5 0 0 0 2 10.5v.5c0 1.971 1.86 4 5 4s5-2.029 5-4zm-9 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v.5c0 1.438-1.432 3-4 3s-4-1.562-4-3zm8.95-7.903a.5.5 0 1 0-.9.438c.289.593.45 1.26.45 1.965a4.5 4.5 0 0 1-.45 1.965a.5.5 0 1 0 .9.438A5.5 5.5 0 0 0 12.5 5c0-.86-.197-1.676-.55-2.403" />
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
