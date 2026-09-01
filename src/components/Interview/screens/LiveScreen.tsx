import React from 'react';

import { CallControls } from '../shared/CallControls';
import { InterviewerIdentity, SpeakingPortrait, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { InterviewerInfo } from '@/constants';

interface LiveScreenProps {
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  agentSpeaking: boolean;
  agentMessage?: string;
  onMute: () => void;
  onPause: () => void;
}

export function LiveScreen({
  onEnd,
  muted,
  paused,
  agentSpeaking,
  agentMessage,
  onMute,
  onPause,
}: LiveScreenProps): JSX.Element {
  return (
    <section
      className={`screen screen--dark interview-screen ${paused ? 'interview-screen--paused' : ''}`}
    >
      <TopBar dark />
      <div className="interview-layout">
        <div className="video-column">
          <InterviewerIdentity />
          <div className="video-frame">
            <SpeakingPortrait isSpeaking={agentSpeaking && !paused} />
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
              {agentMessage ?? `${InterviewerInfo[0].name} is ready. Say hello to begin your mock interview.`}
            </p>
          </div>

          <div className={`listening-card ${muted || paused ? 'listening-card--inactive' : ''}`}>
            <div>
              <span className="mic">&#9833;</span>
              <strong>{paused ? 'Paused' : muted ? 'Microphone muted' : 'Listening...'}</strong>
            </div>
            <Waveform />
          </div>

          <p className="hint">Take your time. {InterviewerInfo[0].name} will listen until you finish your answer.</p>
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
