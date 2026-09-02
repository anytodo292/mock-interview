import React from 'react';

import { TopBar } from '../shared/TopBar';

interface InstallExtensionScreenProps {
  extensionId: string;
}

export function InstallExtensionScreen({ extensionId }: InstallExtensionScreenProps): JSX.Element {
  const storeUrl = `https://chromewebstore.google.com/detail/ntro/${extensionId}`;

  return (
    <section className="screen screen--light results-screen">
      <TopBar />
      <div className="blocking-state">
        <div className="blocking-state__card">
          <div className="blocking-state__main">
            <div className="blocking-state__icon" aria-hidden="true">
              !
            </div>
            <span className="eyebrow">Extension required</span>
            <h1>Install NTRO to continue</h1>
            <p>
              The Chrome extension securely connects this page to your interview. Install it, then
              come back and reload this page.
            </p>
            <div className="blocking-state__actions">
              <a className="primary-button" href={storeUrl} target="_blank" rel="noreferrer">
                Add to Chrome <span>&rarr;</span>
              </a>
              <button className="secondary-button" onClick={() => window.location.reload()}>
                I&apos;ve installed it — reload
              </button>
            </div>
          </div>
          <aside className="blocking-state__steps">
            <span className="blocking-state__step-label">Quick setup</span>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Install NTRO</strong>
                  <small>It only takes a few seconds.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Keep it enabled</strong>
                  <small>Allow NTRO to connect to this page.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Reload and continue</strong>
                  <small>Your interview will appear automatically.</small>
                </div>
              </li>
            </ol>
            <p>Your interview link stays available while you install.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
