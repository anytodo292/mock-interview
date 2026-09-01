import React from 'react';

import { TopBar } from '../shared/TopBar';

interface FinishedScreenProps {
  onAgain: () => void;
}

export function FinishedScreen({ onAgain }: FinishedScreenProps): JSX.Element {
  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="completion-layout">
        <div className="completion-hero">
          <div className="completion-check" aria-hidden="true">
            &#10003;
          </div>
          <span className="eyebrow">Session complete</span>
          <h1>Your mock interview is finished.</h1>
          <p>
            Nice work completing the session. Take a moment to reset, or start another interview
            when you are ready.
          </p>
        </div>

        <div className="completion-card">
          <h2>Interview summary</h2>
          <dl className="session-summary">
            <div>
              <dt>Interview type</dt>
              <dd>Technical interview</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>Senior</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="session-summary__complete">Completed</dd>
            </div>
          </dl>
          <button className="primary-button completion-card__restart" onClick={onAgain}>
            &#8635; Start another interview
          </button>
        </div>
      </div>
    </section>
  );
}
