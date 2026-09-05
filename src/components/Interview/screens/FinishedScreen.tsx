import React from 'react';

import { FinishedInterview } from '../types';
import { TopBar } from '../shared/TopBar';
import { finishInterview } from '@/services/deepgramApi';
import { DifficultyTypeList, InterviewTypeList } from '@/constants';

interface FinishedScreenProps {
  result: FinishedInterview | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReport: () => void;
  onAgain: () => void;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function FinishedScreen({
  result,
  loading,
  error,
  onRetry,
  onReport,
  onAgain,
}: FinishedScreenProps): JSX.Element {
  if (loading) {
    return (
      <section className="screen screen--light results-screen">
        <TopBar />
        <div className="report-state" role="status" aria-live="polite">
          <div className="loading-interview__spinner" aria-hidden="true" />
          <span className="eyebrow">Finishing interview</span>
          <h1>Saving your interview...</h1>
          <p>We&apos;re uploading the final conversation and preparing your results.</p>
        </div>
      </section>
    );
  }

  if (error || !result) {
    return (
      <section className="screen screen--light results-screen">
        <TopBar />
        <div className="report-state" role="alert">
          <div className="blocking-state__icon" aria-hidden="true">
            !
          </div>
          <span className="eyebrow">Unable to save results</span>
          <h1>We couldn&apos;t finish your interview.</h1>
          <p>{error ?? 'The interview summary is unavailable.'}</p>
          <div className="blocking-state__actions">
            <button className="primary-button" onClick={onRetry}>
              Try again
            </button>
            <button className="secondary-button" onClick={onAgain}>
              Return home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const scenarioLabel =
    InterviewTypeList.find((item) => item.id === result.scenario)?.text ?? 'Interview';
  const difficultyLabel =
    DifficultyTypeList.find((item) => item.id === Number(result.difficulty))?.text ??
    String(result.difficulty);

  const score = Math.max(0, Math.min(100, Number(result.overall_score) || 0));
  const scoreAngle = score * 3.6;

  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="results-layout">
        <div className="result-hero">
          <span className="confetti" aria-hidden="true">
            &#10022; &middot; &#10023;
          </span>
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(#1ec67c 0deg ${scoreAngle}deg, #e4e8ee ${scoreAngle}deg 360deg)`,
            }}
          >
            <div>
              <strong>{result.overall_score}</strong>
              <span>Overall score</span>
            </div>
          </div>
          {/* <span className="great-job">Interview complete</span> */}
          <h1>Your mock interview is finished.</h1>
          <p>Your responses have been saved and your evaluation is ready to review.</p>
        </div>

        <div className="completion-card finished-summary-card">
          <div className="finished-summary-card__heading">
            <div>
              <span className="eyebrow">Session summary</span>
              <h2>{scenarioLabel}</h2>
            </div>
            <span className="finished-status">{result.status}</span>
          </div>
          <dl className="session-summary">
            <div>
              <dt>Interview ID</dt>
              <dd>{result.interview_id}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{difficultyLabel}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{formatDuration(result.duration_seconds)}</dd>
            </div>
            <div>
              <dt>Overall score</dt>
              <dd>{result.overall_score}/100</dd>
            </div>
          </dl>
          {result.report_available ? (
            <button className="primary-button completion-card__restart" onClick={onReport}>
              View evaluation report <span>&rarr;</span>
            </button>
          ) : (
            <p className="report-pending">Your detailed evaluation is still being prepared.</p>
          )}
          <button className="secondary-button" onClick={onAgain}>
            Start another interview
          </button>
        </div>
      </div>
    </section>
  );
}
