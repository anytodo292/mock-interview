import React, { useEffect, useRef, useState } from 'react';

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
  const interviewerOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    interviewerOptionRefs.current[selectedInterviewerIdx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedInterviewerIdx]);

  const moveInterviewerSelection = (direction: -1 | 1): void => {
    setSelectedInterviewerIdx(
      (currentIndex) =>
        (currentIndex + direction + InterviewerInfo.length) % InterviewerInfo.length,
    );
  };

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
          <div className="interviewer-picker">
            <div className="setup-heading">
              <div>
                <span className="setup-heading__eyebrow">Choose your interviewer</span>
                <h2>{selectedInterviewer.name}</h2>
              </div>
              <span className="availability">
                <i /> Available
              </span>
            </div>

            <div className="interviewer-slider">
              <button
                type="button"
                className="slider-arrow"
                aria-label="Select previous interviewer"
                onClick={() => moveInterviewerSelection(-1)}
              >
                &#8249;
              </button>
              <div className="interviewer-track" role="list" aria-label="Available interviewers">
                {InterviewerInfo.map((interviewer, index) => {
                  const selected = index === selectedInterviewerIdx;
                  return (
                    <button
                      type="button"
                      role="listitem"
                      key={interviewer.name}
                      ref={(element) => {
                        interviewerOptionRefs.current[index] = element;
                      }}
                      className={`interviewer-option${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => setSelectedInterviewerIdx(index)}
                    >
                      <span className="interviewer-option__portrait">
                        <img src={interviewer.image} alt="" />
                        {selected && <i aria-hidden="true">&#10003;</i>}
                      </span>
                      <span>{interviewer.name}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="slider-arrow"
                aria-label="Select next interviewer"
                onClick={() => moveInterviewerSelection(1)}
              >
                &#8250;
              </button>
            </div>
          </div>

          <div className="interview-summary">
            <div className="profile-labels" aria-label="Interview details">
              <span>{interviewTypeLabel}</span>
              <span>{languageLabel}</span>
            </div>
            <dl className="interview-meta">
              <div>
                <dt>Position</dt>
                <dd>{interviewInfo?.position ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{interviewInfo?.company ?? 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          <div className="form-grid u-mb-4">
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
