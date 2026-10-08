import React, { useEffect, useRef, useState } from 'react';

import { TopBar } from '../shared/TopBar';
import { useTheme } from '../shared/ThemeContext';
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
import { preloadImages } from '@/utils/image';

interface HomeScreenProps {
  onStart: (params: MockInterviewParams) => void;
  initialParams?: MockInterviewParams;
  lockInterview?: boolean;
  interviewInfo?: IInterview;
  deviceCheckError?: string | null;
  onDismissDeviceCheckError?: () => void;
}

function CheckIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.25 3.1 3.1L13 4.75" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }): JSX.Element {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={direction === 'left' ? 'm12.5 4.5-5 5.5 5 5.5' : 'm7.5 4.5 5 5.5-5 5.5'}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function HomeScreen({
  onStart,
  initialParams,
  interviewInfo,
  deviceCheckError,
  onDismissDeviceCheckError,
}: HomeScreenProps): JSX.Element {
  const scenario = initialParams?.scenario ?? InterviewType.TECH_INTERVIEW;
  const { theme } = useTheme();

  const [selectedInterviewerIdx, setSelectedInterviewerIdx] = useState<number>(
    initialParams?.interviewerIndex ?? 0,
  );
  const language = initialParams?.language ?? LangType.ENGLISH;
  const [difficulty, setDifficulty] = useState<number>(
    initialParams?.difficulty ?? DifficultyType.Senior,
  );
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetLoadFailed, setAssetLoadFailed] = useState(false);
  const [permissionRequestError, setPermissionRequestError] = useState<string | null>(null);

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
  
  useEffect(() => {
    let cancelled = false;
    setAssetsReady(false);
    setAssetLoadFailed(false);

    void preloadImages([
      selectedInterviewer.anim_speak,
      selectedInterviewer.anim_listen,
    ]).then(
      () => {
        if (!cancelled) setAssetsReady(true);
      },
      () => {
        if (!cancelled) setAssetLoadFailed(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [selectedInterviewer.anim_listen, selectedInterviewer.anim_speak]);

  useEffect(() => {
    if (!deviceCheckError || !onDismissDeviceCheckError) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onDismissDeviceCheckError();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deviceCheckError, onDismissDeviceCheckError]);

  const moveInterviewerSelection = (direction: -1 | 1): void => {
    setSelectedInterviewerIdx(
      (currentIndex) =>
        (currentIndex + direction + InterviewerInfo.length) % InterviewerInfo.length,
    );
  };

  const handleMockInterviewStartClick = (): void => {
    if (!assetsReady) return;
    onStart({ scenario, language, difficulty, interviewerIndex: selectedInterviewerIdx });
  };

  const requestMicrophonePermission = async (): Promise<void> => {
    setPermissionRequestError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      onDismissDeviceCheckError?.();
    } catch {
      setPermissionRequestError(
        'Permission is still blocked. Use the permissions icon in the address bar.',
      );
    }
  };

  return (
    <section className={`screen screen--${theme} home-screen`}>
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
            <span>
              <CheckIcon /> Real interview questions
            </span>
            <span>
              <CheckIcon /> Instant coaching report
            </span>
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
                <ChevronIcon direction="left" />
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
                        {selected && (
                          <i>
                            <CheckIcon />
                          </i>
                        )}
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
                <ChevronIcon direction="right" />
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
                <dd>
                  {interviewInfo?.position && interviewInfo.position.length > 0
                    ? interviewInfo.position
                    : '--'}
                </dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>
                  {interviewInfo?.company && interviewInfo.company.length > 0
                    ? interviewInfo.company
                    : '--'}
                </dd>
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

          <button
            className="primary-button"
            disabled={!assetsReady}
            onClick={handleMockInterviewStartClick}
          >
            {assetLoadFailed
              ? 'Unable to prepare interviewer'
              : assetsReady
                ? 'Start mock interview'
                : 'Preparing...'
            }
          </button>
        </div>
      </div>
      {deviceCheckError && (
        <div
          className="device-alert"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onDismissDeviceCheckError?.();
          }}
        >
          <div
            className="device-alert__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="device-alert-title"
            aria-describedby="device-alert-message"
          >
            <h2 id="device-alert-title">Device check</h2>
            <p id="device-alert-message">
              {deviceCheckError} Check the device connection and review{' '}
              <button
                type="button"
                className="device-alert__settings-link"
                onClick={() => requestMicrophonePermission()}
              >
                site settings
              </button>
              , then try again.
            </p>
            {permissionRequestError && (
              <p className="device-alert__permission-error" role="status">
                {permissionRequestError}
              </p>
            )}
            <button
              type="button"
              className="primary-button"
              autoFocus
              onClick={onDismissDeviceCheckError}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
