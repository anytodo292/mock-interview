import React from 'react';

import { TopBar } from '../shared/TopBar';

export function InvalidInterviewScreen(): JSX.Element {
  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="blocking-state">
        <div className="blocking-state__card">
          <div className="blocking-state__main">
            <div className="blocking-state__icon" aria-hidden="true">
              !
            </div>
            <span className="eyebrow">Interview unavailable</span>
            <h1>This interview link isn&apos;t valid</h1>
            <p>It may have already been finished, or the address may be incomplete.</p>
            <div className="blocking-state__actions">
              <button className="secondary-button" onClick={() => window.location.reload()}>
                Try this link again
              </button>
            </div>
          </div>
          <aside className="blocking-state__steps">
            <span className="blocking-state__step-label">Before trying again</span>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Return to NTRO</strong>
                  <small>Open the extension you used to create this mock interview.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Check mock interview status</strong>
                  <small>Open the "Practice" tab and make sure the mock interview is not marked as completed.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Launch it again</strong>
                  <small>Select the mock interview and start again it using a valid link provided by NTRO.</small>
                </div>
              </li>
            </ol>
            <p>For security, invalid links cannot be restored from this page.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
