import React from 'react';

import { TopBar } from '../shared/TopBar';

export function InvalidInterviewScreen(): JSX.Element {
  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="completion-layout">
        <div className="completion-hero">
          <div className="completion-check" aria-hidden="true">
            !
          </div>
          <span className="eyebrow">Interview unavailable</span>
          <h1>This interview link is not valid.</h1>
          <p>
            The interview may have expired, already been completed, or the link may be incorrect.
            Please return to the extension and request a new interview.
          </p>
        </div>
      </div>
    </section>
  );
}
