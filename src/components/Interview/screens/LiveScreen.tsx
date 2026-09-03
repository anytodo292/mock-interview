import React from 'react';

import { CallControls } from '../shared/CallControls';
import { InterviewerIdentity, SpeakingPortrait, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { Interviewer } from '@/constants';

interface LiveScreenProps {
  interviewer: Interviewer;
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  agentSpeaking: boolean;
  userSpeaking: boolean;
  agentMessage?: string;
  onMute: () => void;
  onPause: () => void;
}

export function LiveScreen({
  interviewer,
  onEnd,
  muted,
  paused,
  agentSpeaking,
  userSpeaking,
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
          <InterviewerIdentity interviewer={interviewer} />
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
              <span className="mic">&#9833;</span>
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
            onMute={onMute}
            onPause={onPause}
          />
        </div>
      </div>
    </section>
  );
}
