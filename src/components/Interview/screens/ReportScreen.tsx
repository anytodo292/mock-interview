import React, { useState } from 'react';

import { EvaluationCompetency, InterviewEvaluation } from '../types';
import { TopBar } from '../shared/TopBar';
import { useTheme } from '../shared/ThemeContext';
import { DifficultyTypeList, InterviewTypeList } from '@/constants';
import { IInterview } from '@/types';

interface ReportScreenProps {
  interview?: IInterview;
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

function CompetencyRadar({ competencies }: { competencies: EvaluationCompetency[] }): JSX.Element {
  const centerX = 210;
  const centerY = 175;
  const radius = 108;
  const labelRadius = 142;
  const angleFor = (index: number): number =>
    -Math.PI / 2 + (index * Math.PI * 2) / competencies.length;
  const pointAt = (index: number, distance: number): [number, number] => {
    const angle = angleFor(index);
    return [centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance];
  };
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const scorePoints = competencies.map((competency, index) => {
    const score = Math.max(0, Math.min(100, Number(competency.score) || 0));
    return pointAt(index, radius * (score / 100));
  });
  const pointsAttribute = (points: Array<[number, number]>): string =>
    points.map(([x, y]) => `${x},${y}`).join(' ');
  const scoreDescription = competencies
    .map(({ name, score }) => `${name}: ${score} out of 100`)
    .join(', ');

  return (
    <div className="competency-radar">
      <svg
        viewBox="0 0 420 350"
        role="img"
        aria-label={`Competency spider chart. ${scoreDescription}`}
      >
        <g className="competency-radar__grid">
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={pointsAttribute(
                competencies.map((_, index) => pointAt(index, radius * level)),
              )}
            />
          ))}
          {competencies.map(({ name }, index) => {
            const [x, y] = pointAt(index, radius);
            return <line key={name} x1={centerX} y1={centerY} x2={x} y2={y} />;
          })}
        </g>
        <polygon className="competency-radar__score" points={pointsAttribute(scorePoints)} />
        {competencies.map((competency, index) => {
          const angle = angleFor(index);
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;
          const anchor =
            Math.cos(angle) > 0.25 ? 'start' : Math.cos(angle) < -0.25 ? 'end' : 'middle';
          return (
            <g key={competency.name}>
              <circle
                className="competency-radar__point"
                cx={scorePoints[index][0]}
                cy={scorePoints[index][1]}
                r="4"
              />
              <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle">
                <tspan x={x}>{competency.name}</tspan>
                <tspan className="competency-radar__label-score" x={x} dy="15">
                  {Math.max(0, Math.min(100, Number(competency.score) || 0))}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ReportScreen({
  interview,
  evaluation,
  loading,
  error,
  onRetry,
  onAgain,
}: ReportScreenProps): JSX.Element {
  const { theme } = useTheme();

  const [openSection, setOpenSection] = useState('Strengths');
  const [activeSection, setActiveSection] = useState('summary');

  if (loading) {
    return (
      <section className={`screen screen--${theme} report-screen`}>
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
      <section className={`screen screen--${theme} report-screen`}>
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
    {
      title: 'Strengths',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m5 12 4 4L19 6" />
        </svg>
      ),
      points: evaluation.strengths,
    },
    {
      title: 'Areas to improve',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 2.8 20h18.4L12 3Z" />
          <path d="M12 9v5M12 17.5v.1" />
        </svg>
      ),
      points: evaluation.areas_to_improve,
    },
    {
      title: 'Suggested learning',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
          <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" />
        </svg>
      ),
      points: evaluation.suggested_learning,
    },
    {
      title: 'AI feedback',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a7 7 0 0 0-4 12.7V19h8v-3.3A7 7 0 0 0 12 3Z" />
          <path d="M9 22h6M9 10h.01M15 10h.01M9.5 13.5a4 4 0 0 0 5 0" />
        </svg>
      ),
      points: evaluation.ai_feedback,
    },
  ];

  const scenarioLabel =
    InterviewTypeList.find((item) => item.id === evaluation.scenario)?.text ?? 'Interview';
  const difficultyLabel =
    DifficultyTypeList.find((item) => item.id === Number(evaluation.difficulty))?.text ??
    String(evaluation.difficulty);
  
  const infoList = [];
  if (interview?.company) infoList.push(interview?.company);
  if (interview?.position) infoList.push(interview?.position);

  const score = Math.max(0, Math.min(100, Number(evaluation.overall_score) || 0));
  const scoreAngle = score * 3.6;

  const downloadReport = (): void => {
    const formatList = (items: string[]): string =>
      items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : 'None provided';

    const competencies =
      evaluation.competencies.length > 0
        ? evaluation.competencies
            .map((competency) => `- ${competency.name}: ${competency.score}/100`)
            .join('\n')
        : 'None provided';
    const transcript =
      evaluation.transcript.length > 0
        ? evaluation.transcript
            .map((entry) => {
              const speaker = entry.speaker === 'you' ? 'You' : 'Interviewer';
              const timestamp = new Date(entry.capturedAt).toLocaleString();
              return `[${timestamp}] ${speaker}: ${entry.talk}`;
            })
            .join('\n\n')
        : 'No transcript available';
    const report = [
      'INTERVIEW EVALUATION REPORT',
      '===========================',
      '',
      `Interview ID: ${evaluation.interview_id}`,
      `Scenario: ${scenarioLabel}`,
      `Difficulty: ${difficultyLabel}`,
      `Duration: ${formatDuration(evaluation.duration_seconds)}`,
      `Overall score: ${evaluation.overall_score}/100`,
      `Generated: ${new Date(evaluation.generated_at).toLocaleString()}`,
      '',
      'COMPETENCIES',
      '------------',
      competencies,
      '',
      'STRENGTHS',
      '---------',
      formatList(evaluation.strengths),
      '',
      'AREAS TO IMPROVE',
      '----------------',
      formatList(evaluation.areas_to_improve),
      '',
      'SUGGESTED LEARNING',
      '------------------',
      formatList(evaluation.suggested_learning),
      '',
      'AI FEEDBACK',
      '-----------',
      formatList(evaluation.ai_feedback),
      '',
      'INTERVIEW TRANSCRIPT',
      '--------------------',
      transcript,
    ].join('\n');

    const file = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-evaluation-${evaluation.interview_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={`screen screen--${theme} report-screen`}>
      <TopBar />
      <div className="report-heading" id="summary">
        <div>
          <span className="eyebrow">Interview complete</span>
          <h1>Your detailed interview report</h1>
          {infoList.length > 0&& <p style={{ marginBottom: 5 }}>{infoList.join(' · ')}</p>}
          <p>
            {scenarioLabel}{' · '}{difficultyLabel}{' · '}
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
            <div className="competency-breakdown">
              {evaluation.competencies.length >= 3 && (
                <CompetencyRadar competencies={evaluation.competencies} />
              )}
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
                    <b aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h14" />
                        {!open && <path d="M12 5v14" />}
                      </svg>
                    </b>
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
              Practice again
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
