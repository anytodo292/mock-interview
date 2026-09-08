import React, { useState } from 'react';

import { Avatar, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { MockInterviewParams } from '../types';
import {
  getInterviewerInfo,
  InterviewType,
  LangType,
  DifficultyType,
  InterviewTypeList,
  LangTypeList,
  DifficultyTypeList,
  InterviewerInfo,
} from '@/constants';
import { IInterview } from '@/types';

interface HomeScreenProps {
  onStart: (params: MockInterviewParams) => void;
  initialParams?: MockInterviewParams;
  lockInterview?: boolean;
  interviewInfo?: IInterview;
}

export function HomeScreen({
  onStart,
  initialParams,
  interviewInfo,
}: HomeScreenProps): JSX.Element {
  const scenario = initialParams?.scenario ?? InterviewType.TECH_INTERVIEW;
  const [selectedInterviewerIdx, setSelectedInterviewerIdx] = useState<number>(
    initialParams?.interviewerIndex ?? 0,
  );
  const language = initialParams?.language ?? LangType.ENGLISH;
  const [difficulty, setDifficulty] = useState<number>(
    initialParams?.difficulty ?? DifficultyType.Senior,
  );
  const selectedInterviewer = getInterviewerInfo(selectedInterviewerIdx);
  const interviewTypeLabel =
    InterviewTypeList.find((item) => item.id === scenario)?.text ?? 'Interview';
  const languageLabel =
    LangTypeList.find((item) => item.id === language)?.country ?? 'Unknown language';

  const handleMockInterviewStartClick = (): void => {
    onStart({ scenario, language, difficulty, interviewerIndex: selectedInterviewerIdx });
  };

  return (
    <section className="screen screen--light home-screen">
      <TopBar />
      <div className="home-grid">
        <div className="home-copy">
          <span className="eyebrow">AI-powered practice</span>
          <h1>Walk into your next interview with confidence.</h1>
          <p>
            Practice with {selectedInterviewer.name}, your realistic AI interviewer, and get focused
            feedback after every session.
          </p>
          <div className="benefit-row">
            <span>&#10003; Real interview questions</span>
            <span>&#10003; Instant coaching report</span>
          </div>
        </div>

        <div className="setup-card">
          <div className="profile-block">
            <div className="profile-visual">
              <Waveform />
              <Avatar interviewer={selectedInterviewer} />
              <span className="online">Online</span>
            </div>
            <h2>
              {selectedInterviewer.name} <span className="verified">&#10003;</span>
            </h2>
            <div className="profile-labels" aria-label="Interview details">
              <span>{interviewTypeLabel}</span>
              <span>{languageLabel}</span>
            </div>
            <p>
              {interviewInfo?.position ?? '--'}
              <br />
              {interviewInfo?.company ?? '--'}
            </p>
          </div>

          <div className="form-grid form-grid--setup u-mb-4">
            <label>
              Interviewer
              <select
                value={selectedInterviewerIdx}
                onChange={(e) => setSelectedInterviewerIdx(Number(e.target.value))}
              >
                {InterviewerInfo.map((v, index) => (
                  <option key={v.name} value={index}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
              >
                {DifficultyTypeList.map((v, index) => (
                  <option key={index} value={v.id}>
                    {v.text}
                  </option>
                ))}
              </select>
            </label>
            {/* <label>
              Duration
              <select defaultValue="30">
                <option value="30">30 Minutes</option>
                <option>45 Minutes</option>
                <option>60 Minutes</option>
              </select>
            </label> */}
          </div>

          {/* <div className="checks">
            <label>
              <input type="checkbox" defaultChecked /> Use my resume
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Use job description
            </label>
          </div> */}

          <button className="primary-button" onClick={handleMockInterviewStartClick}>
            Start mock interview
          </button>
        </div>
      </div>
    </section>
  );
}
