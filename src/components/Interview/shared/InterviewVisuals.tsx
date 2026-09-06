import React from 'react';
import { Interviewer, MAX_INTERVIEW_DURATION_SECONDS } from '@/constants';
import { IInterview } from '@/types';

const waveHeights = [
  10, 18, 30, 16, 38, 24, 44, 20, 34, 14, 27, 42, 18, 31, 12, 22, 36, 17, 26, 10,
];

export function Avatar({
  interviewer,
  small = false,
}: {
  interviewer: Interviewer;
  small?: boolean;
}): JSX.Element {
  return (
    <img
      className={`avatar ${small ? 'avatar--small' : ''}`}
      src={interviewer.image}
      alt={`${interviewer.name}, AI interviewer`}
    />
  );
}

export function SpeakingPortrait({
  interviewer,
  isSpeaking,
}: {
  interviewer: Interviewer;
  isSpeaking: boolean;
}): JSX.Element {
  return (
    <img
      key={isSpeaking ? 'speaking' : 'idle'}
      className="portrait-frame portrait-frame--visible"
      src={isSpeaking ? interviewer.anim : interviewer.image}
      alt={
        isSpeaking
          ? `${interviewer.name} speaking`
          : `${interviewer.name} waiting for your response`
      }
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

export function InterviewerIdentity({
  interviewer,
  interviewInfo,
  elapsedSeconds = 0,
}: {
  interviewer: Interviewer;
  interviewInfo?: IInterview;
  elapsedSeconds?: number;
}): JSX.Element {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .filter((_, index) => hours > 0 || index > 0)
      .map((value) => value.toString().padStart(2, '0'))
      .join(':');
  };
  const elapsedTime = formatTime(Math.min(elapsedSeconds, MAX_INTERVIEW_DURATION_SECONDS));
  const maximumTime = formatTime(MAX_INTERVIEW_DURATION_SECONDS);

  return (
    <div className="identity">
      <Avatar interviewer={interviewer} small />
      <div>
        <strong>
          {interviewer.name} <span className="verified">&#10003;</span>
        </strong>
        <small>{interviewInfo?.position ?? '--'}</small>
        <small>{interviewInfo?.company ?? '--'}</small>
      </div>
      <div className="identity__time">
        <span aria-label={`${elapsedTime} elapsed of ${maximumTime} maximum`}>
          {elapsedTime} / {maximumTime}
        </span>{' '}
        <i />
      </div>
    </div>
  );
}
