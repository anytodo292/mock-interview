import React, { useState } from 'react';

import { Avatar, Waveform } from '../shared/InterviewVisuals';
import { TopBar } from '../shared/TopBar';
import { MockInterviewParams } from '../types';

interface HomeScreenProps {
  onStart: (params: MockInterviewParams) => void;
}

const InterviewType = {
  // QUICK_CALL: -1,
  TECH_INTERVIEW: 0,
  // HR_INTERVIEW: 1,
  TEAM_MEETING: 2,
  CLIENT_MEETING: 3,
  CONSULTING: 4,
  CASUAL_CONVERSATION: 5,
  ONLINE_ASSESSMENT: 6,

  SCREENING_INTERVIEW: 7,
  CODING_INTERVIEW: 8,
  SYS_DESGIN_INTERVIEW: 9,
  BEHAV_INTERVIEW: 10,
  CASE_INTERVIEW: 11,
  SITUATION_INTERVIEW: 12,
  CULTURE_INTERVIEW: 13,
  FINAL_INTERVIEW: 14,
  AI_INTERVIEW: 15,
};

const LangType = {
  CHINESE: 0,
  DUTCH: 1,
  ENGLISH: 2,
  FRENCH: 3,
  GERMAN: 4,
  ITALIAN: 5,
  JAPANESE: 6,
  SPANISH: 7,
  RUSSIAN: 8,
  ARABIC: 9,
  PORTUGUESE: 10,
  KOREAN: 11,
};

const DifficultyType = {
  Junior: 0,
  Mid: 1,
  Senior: 2,
};

export function HomeScreen({ onStart }: HomeScreenProps): JSX.Element {
  const [scenario, setScenario] = useState<number>(InterviewType.TECH_INTERVIEW);
  const [language, setLanguage] = useState<number>(LangType.ENGLISH);
  const [difficulty, setDifficulty] = useState<number>(DifficultyType.Senior);

  const InterviewTypeList: { id: number; text: string }[] = [
    { id: InterviewType.SCREENING_INTERVIEW, text: 'Screening Interview' },
    { id: InterviewType.TECH_INTERVIEW, text: 'Technical Interview' },
    { id: InterviewType.CODING_INTERVIEW, text: 'Coding Interview' },
    { id: InterviewType.SYS_DESGIN_INTERVIEW, text: 'System Design Interview' },
    { id: InterviewType.BEHAV_INTERVIEW, text: 'Behavioral Interview' },
    { id: InterviewType.CASE_INTERVIEW, text: 'Case Interview' },
    { id: InterviewType.SITUATION_INTERVIEW, text: 'Situational Interview' },
    { id: InterviewType.CULTURE_INTERVIEW, text: 'Culture Fit Interview' },
    { id: InterviewType.FINAL_INTERVIEW, text: 'Hiring Manager Interview' },
    { id: InterviewType.AI_INTERVIEW, text: 'AI-Driven Interview' },
    { id: InterviewType.TEAM_MEETING, text: 'Team Meeting' },
    { id: InterviewType.CLIENT_MEETING, text: 'Client Meeting' },
    { id: InterviewType.CONSULTING, text: 'Consultation Meeting' },
    { id: InterviewType.CASUAL_CONVERSATION, text: 'Casual Conversation' },
    { id: InterviewType.ONLINE_ASSESSMENT, text: 'Online Assessment' },
  ];

  const LangTypeList = [
    { id: LangType.DUTCH, country: 'Dutch (Nederlands)', deepgramCode: 'nl' },
    { id: LangType.ENGLISH, country: 'English (US)', deepgramCode: 'en' },
    { id: LangType.FRENCH, country: 'French (Français)', deepgramCode: 'fr' },
    { id: LangType.GERMAN, country: 'German (Deutsch)', deepgramCode: 'de' },
    { id: LangType.ITALIAN, country: 'Italian (Italiano)', deepgramCode: 'it' },
    { id: LangType.JAPANESE, country: 'Japanese (日本語)', deepgramCode: 'ja' },
    { id: LangType.SPANISH, country: 'Spanish (Español)', deepgramCode: 'es' }
  ];

  const DifficultyTypeList: { id: number; text: string }[] = [
    { id: DifficultyType.Junior, text: 'Junior' },
    { id: DifficultyType.Mid, text: 'Mid-Level' },
    { id: DifficultyType.Senior, text: 'Senior' },
  ];

  const handleMockInterviewStartClick = (): void => {
    onStart({ scenario, language, difficulty });
  };

  return (
    <section className="screen screen--light home-screen">
      <TopBar />
      <div className="home-grid">
        <div className="home-copy">
          <span className="eyebrow">AI-powered practice</span>
          <h1>Walk into your next interview with confidence.</h1>
          <p>
            Practice with Emma, your realistic AI interviewer, and get focused feedback after every
            session.
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
              <Avatar />
              <span className="online">Online</span>
            </div>
            <h2>
              Emma <span className="verified">&#10003;</span>
            </h2>
            <p>
              Senior Engineering Manager
              <br />
              Google &middot; 15+ years experience
            </p>
          </div>

          <div className="form-grid u-mb-4">
            <label>
              Interview type
              <select value={scenario} onChange={(e) => setScenario(parseInt(e.target.value, 10))}>
                {InterviewTypeList.map((v, index) => (
                  <option key={index} value={v.id}>
                    {v.text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Language
              <select value={language} onChange={(e) => setLanguage(parseInt(e.target.value, 10))}>
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
            &#9673; Start mock interview <span>&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
