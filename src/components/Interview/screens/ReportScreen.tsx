import React, { useState } from 'react';

import { TopBar } from '../shared/TopBar';

const reportSections = [
  {
    icon: '✓',
    title: 'Strengths',
    points: [
      'Clear communication and strong answer structure',
      'Strong understanding of system design concepts',
      'Practical, thoughtful problem-solving approach',
    ],
  },
  {
    icon: '△',
    title: 'Areas to improve',
    points: [
      'Quantify the impact of your previous work',
      'Explain trade-offs before choosing a solution',
    ],
  },
  {
    icon: '◎',
    title: 'Suggested learning',
    points: ['Review distributed-system failure modes', 'Practice concise STAR-format stories'],
  },
  {
    icon: '▤',
    title: 'Transcript',
    points: ['A complete transcript of your interview is ready to review.'],
  },
  {
    icon: '●',
    title: 'AI feedback',
    points: ['Pause briefly before answering and lead with your main conclusion.'],
  },
] as const;

interface ReportScreenProps {
  onAgain: () => void;
}

export function ReportScreen({ onAgain }: ReportScreenProps): JSX.Element {
  const [openSection, setOpenSection] = useState('Strengths');

  return (
    <section className="screen screen--light report-screen">
      <TopBar />
      <div className="report-heading">
        <div>
          <span className="eyebrow">Interview complete</span>
          <h1>Your detailed interview report</h1>
          <p>Technical interview &middot; Senior &middot; 30 minutes</p>
        </div>
        <div className="mini-score">
          <strong>87</strong>
          <span>Overall score</span>
        </div>
      </div>

      <div className="report-layout">
        <aside>
          <h3>Report overview</h3>
          <a href="#summary" className="active">
            ▥ Overview
          </a>
          <a href="#details">✓ Competencies</a>
          <a href="#details">▤ Transcript</a>
          <a href="#details">● AI feedback</a>
        </aside>

        <div id="details" className="accordion">
          <h2>Feedback & next steps</h2>
          {reportSections.map(({ icon, title, points }) => {
            const open = openSection === title;

            return (
              <div className={`report-item ${open ? 'report-item--open' : ''}`} key={title}>
                <button onClick={() => setOpenSection(open ? '' : title)}>
                  <span>
                    <i>{icon}</i>
                    {title}
                  </span>
                  <b>{open ? '⌃' : '⌄'}</b>
                </button>
                {open && (
                  <div>
                    {points.map((point) => (
                      <p key={point}>{point}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="report-actions">
            <button className="primary-button">⇩ Download report</button>
            <button className="secondary-button" onClick={onAgain}>
              ↻ Practice again
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
