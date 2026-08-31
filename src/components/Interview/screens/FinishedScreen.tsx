import React from 'react';

import { TopBar } from '../shared/TopBar';

const scores = [
  ['Communication', 90, 'green'],
  ['Technical knowledge', 84, 'blue'],
  ['Problem solving', 88, 'purple'],
  ['Confidence', 81, 'orange'],
  ['Structure & clarity', 85, 'blue'],
] as const;

interface FinishedScreenProps {
  onReport?: () => void;
  onAgain: () => void;
}

function ScoreRing(): JSX.Element {
  return (
    <div className="score-ring">
      <div>
        <strong>87</strong>
        <span>Overall score</span>
      </div>
    </div>
  );
}

export function FinishedScreen({ onReport, onAgain }: FinishedScreenProps): JSX.Element {
  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="results-layout">
        <div className="result-hero">
          <span className="confetti">&#10022; &middot; &#10023;</span>
          <ScoreRing />
          <span className="great-job">Great job!</span>
          <h1>You showed strong senior-level skills.</h1>
          <p>Your answers were clear, thoughtful, and grounded in real-world experience.</p>
        </div>
        <div className="score-card">
          <h2>Performance breakdown</h2>
          {scores.map(([label, score, color]) => (
            <div className="score-row" key={label}>
              <span>{label}</span>
              <div>
                <i className={`score-fill score-fill--${color}`} style={{ width: `${score}%` }} />
              </div>
              <strong className={`text-${color}`}>{score}</strong>
            </div>
          ))}
          <button className="primary-button" onClick={onReport}>
            &#9636; View detailed report <span>&rarr;</span>
          </button>
          <button className="secondary-button" onClick={onAgain}>
            &#8635; Practice again
          </button>
        </div>
      </div>
    </section>
  );
}
