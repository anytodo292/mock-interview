import React, { useState } from 'react';

import { Avatar, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { MockInterviewParams } from '../types';
import { getInterviewerInfo, InterviewType, LangType, DifficultyType, InterviewTypeList, LangTypeList, DifficultyTypeList } from '@/constants';
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
  lockInterview = false,
  interviewInfo,
}: HomeScreenProps): JSX.Element {
  const [scenario, setScenario] = useState<number>(
    initialParams?.scenario ?? InterviewType.TECH_INTERVIEW,
  );
  const [language, setLanguage] = useState<number>(initialParams?.language ?? LangType.ENGLISH);
  const [difficulty, setDifficulty] = useState<number>(
    initialParams?.difficulty ?? DifficultyType.Senior,
  );

  const selectedInterviewer = getInterviewerInfo(language);

  const handleMockInterviewStartClick = (): void => {
    onStart({ scenario, language, difficulty });
  };

  const handleLanguageChange = (lang: number): void => {
    setLanguage(lang);
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
            <p>
              {interviewInfo?.position?? '--'}
              <br />
              {interviewInfo?.company?? '--'}
            </p>
          </div>

          <div className="form-grid u-mb-4">
            <label>
              Interview type
              <select
                value={scenario}
                disabled={lockInterview}
                onChange={(e) => setScenario(parseInt(e.target.value, 10))}
              >
                {InterviewTypeList.map((v, index) => (
                  <option key={index} value={v.id}>
                    {v.text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Language
              <select
                value={language}
                disabled={lockInterview}
                onChange={(e) => handleLanguageChange(parseInt(e.target.value, 10))}
              >
                {LangTypeList.map((v, index) => (
                  <option key={index} value={v.id}>
                    {v.country}
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
            Start mock interview <span>&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
