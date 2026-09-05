import React, { useState } from 'react';

import { InterviewEvaluation } from '../types';
import { TopBar } from '../shared/TopBar';
import { DifficultyTypeList, InterviewTypeList } from '@/constants';

interface ReportScreenProps {
  evaluation: InterviewEvaluation | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAgain: () => void;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function ReportScreen({
  evaluation,
  loading,
  error,
  onRetry,
  onAgain,
}: ReportScreenProps): JSX.Element {
  const [openSection, setOpenSection] = useState('Strengths');
  const [activeSection, setActiveSection] = useState('summary');

  if (loading) {
    return (
      <section className="screen screen--light report-screen">
        <TopBar />
        <div className="report-state" role="status" aria-live="polite">
          <div className="loading-interview__spinner" aria-hidden="true" />
          <span className="eyebrow">Evaluation in progress</span>
          <h1>Preparing your interview report...</h1>
          <p>We&apos;re reviewing your responses and identifying actionable feedback.</p>
        </div>
      </section>
    );
  }

  if (error || !evaluation) {
    return (
      <section className="screen screen--light report-screen">
        <TopBar />
        <div className="report-state" role="alert">
          <div className="blocking-state__icon" aria-hidden="true">
            !
          </div>
          <span className="eyebrow">Report unavailable</span>
          <h1>We couldn&apos;t load your evaluation.</h1>
          <p>{error ?? 'The evaluation report is not available yet.'}</p>
          <div className="blocking-state__actions">
            <button className="primary-button" onClick={onRetry}>
              Try again
            </button>
            <button className="secondary-button" onClick={onAgain}>
              Start another interview
            </button>
          </div>
        </div>
      </section>
    );
  }

  const sections = [
    { title: 'Strengths', icon: '✓', points: evaluation.strengths },
    { title: 'Areas to improve', icon: '△', points: evaluation.areas_to_improve },
    { title: 'Suggested learning', icon: '◎', points: evaluation.suggested_learning },
    { title: 'AI feedback', icon: '●', points: evaluation.ai_feedback },
  ];

  const downloadReport = (): void => {
    const file = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-evaluation-${evaluation.interview_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const scenarioLabel =
    InterviewTypeList.find((item) => item.id === evaluation.scenario)?.text ?? 'Interview';
  const difficultyLabel =
    DifficultyTypeList.find((item) => item.id === Number(evaluation.difficulty))?.text ??
    String(evaluation.difficulty);
  const score = Math.max(0, Math.min(100, Number(evaluation.overall_score) || 0));
  const scoreAngle = score * 3.6;

  return (
    <section className="screen screen--light report-screen">
      <TopBar />
      <div className="report-heading" id="summary">
        <div>
          <span className="eyebrow">Interview complete</span>
          <h1>Your detailed interview report</h1>
          <p>
            {scenarioLabel} &middot; {difficultyLabel} &middot;{' '}
            {formatDuration(evaluation.duration_seconds)}
          </p>
        </div>
        <div
          className="mini-score"
          style={{
            background: `conic-gradient(#35c88a 0deg ${scoreAngle}deg, #e4e8ee ${scoreAngle}deg 360deg)`,
          }}
        >
          <strong>{evaluation.overall_score}</strong>
          <span>Overall score</span>
        </div>
      </div>

      <div className="report-layout">
        <aside>
          <h3>Report overview</h3>
          <a
            href="#summary"
            className={activeSection === 'summary' ? 'active' : ''}
            aria-current={activeSection === 'summary' ? 'location' : undefined}
            onClick={() => setActiveSection('summary')}
          >
            Overview
          </a>
          <a
            href="#competencies"
            className={activeSection === 'competencies' ? 'active' : ''}
            aria-current={activeSection === 'competencies' ? 'location' : undefined}
            onClick={() => setActiveSection('competencies')}
          >
            Competencies
          </a>
          <a
            href="#feedback"
            className={activeSection === 'feedback' ? 'active' : ''}
            aria-current={activeSection === 'feedback' ? 'location' : undefined}
            onClick={() => setActiveSection('feedback')}
          >
            Feedback
          </a>
          <a
            href="#transcript"
            className={activeSection === 'transcript' ? 'active' : ''}
            aria-current={activeSection === 'transcript' ? 'location' : undefined}
            onClick={() => setActiveSection('transcript')}
          >
            Transcript
          </a>
        </aside>

        <div className="report-content">
          <section className="report-panel" id="competencies">
            <div className="report-panel__heading">
              <div>
                <span className="eyebrow">Performance</span>
                <h2>Competency breakdown</h2>
              </div>
              <span>{evaluation.competencies.length} competencies</span>
            </div>
            <div className="competency-list">
              {evaluation.competencies.map(({ name, score }) => (
                <div className="competency-row" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <span>{score}/100</span>
                  </div>
                  <div className="competency-track" aria-label={`${name}: ${score} out of 100`}>
                    <i style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="feedback" className="accordion report-feedback">
            <h2>Feedback and next steps</h2>
            {sections.map(({ icon, title, points }) => {
              const open = openSection === title;
              return (
                <div className={`report-item ${open ? 'report-item--open' : ''}`} key={title}>
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? '' : title)}
                    aria-expanded={open}
                  >
                    <span>
                      <i>{icon}</i>
                      {title}
                    </span>
                    <b aria-hidden="true">{open ? '−' : '+'}</b>
                  </button>
                  {open && (
                    <div>
                      {points.length > 0 ? (
                        points.map((point) => <p key={point}>{point}</p>)
                      ) : (
                        <p>No feedback provided.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="report-panel" id="transcript">
            <div className="report-panel__heading">
              <div>
                <span className="eyebrow">Conversation</span>
                <h2>Interview transcript</h2>
              </div>
              <span>{evaluation.transcript.length} turns</span>
            </div>
            <div className="report-transcript">
              {evaluation.transcript.length > 0 ? (
                evaluation.transcript.map((entry, index) => (
                  <article
                    className={`transcript-turn transcript-turn--${entry.speaker}`}
                    key={entry.id ?? `${entry.capturedAt}-${index}`}
                  >
                    <div>
                      <strong>{entry.speaker === 'you' ? 'You' : 'Interviewer'}</strong>
                      <time dateTime={entry.capturedAt}>
                        {new Date(entry.capturedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <p>{entry.talk}</p>
                  </article>
                ))
              ) : (
                <p className="report-empty">No transcript was returned.</p>
              )}
            </div>
          </section>

          <div className="report-actions">
            <button className="primary-button" onClick={downloadReport}>
              Download report
            </button>
            <button className="secondary-button" onClick={onAgain}>
              Start another interview
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
