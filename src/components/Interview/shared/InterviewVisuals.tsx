import React from 'react';
import { InterviewerInfo } from '@/constants';

const waveHeights = [
  10, 18, 30, 16, 38, 24, 44, 20, 34, 14, 27, 42, 18, 31, 12, 22, 36, 17, 26, 10,
];

export function Avatar({ small = false }: { small?: boolean }): JSX.Element {
  return (
    <img
      className={`avatar ${small ? 'avatar--small' : ''}`}
      src={InterviewerInfo[0].image}
      alt={`${InterviewerInfo[0].name}, AI interviewer`}
    />
  );
}

export function SpeakingPortrait({ isSpeaking }: { isSpeaking: boolean }): JSX.Element {
  return (
    <img
      key={isSpeaking ? 'speaking' : 'idle'}
      className="portrait-frame portrait-frame--visible"
      src={isSpeaking ? InterviewerInfo[0].anim : InterviewerInfo[0].image}
      alt={isSpeaking ? `${InterviewerInfo[0].name} speaking` : `${InterviewerInfo[0].name} waiting for your response`}
    />
  );
}

export function Waveform({ green = false }: { green?: boolean }): JSX.Element {
  return (
    <div className={`waveform ${green ? 'waveform--green' : ''}`} aria-hidden="true">
      {waveHeights.map((height, index) => (
        <i key={index} style={{ height }} />
      ))}
    </div>
  );
}

export function InterviewerIdentity({ time = '08:42' }: { time?: string }): JSX.Element {
  return (
    <div className="identity">
      <Avatar small />
      <div>
        <strong>
          {InterviewerInfo[0].name} <span className="verified">&#10003;</span>
        </strong>
        <small>Senior Engineering Manager</small>
        <small>Google</small>
      </div>
      <div className="identity__time">
        {time} <i />
      </div>
    </div>
  );
}
