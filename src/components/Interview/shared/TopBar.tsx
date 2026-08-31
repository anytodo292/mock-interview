import React from 'react';

function Logo(): JSX.Element {
  return (
    <div className="brand">
      <span className="brand__mark">N</span>
      <span>NTRO Copilot</span>
    </div>
  );
}

export function TopBar({ dark = false }: { dark?: boolean }): JSX.Element {
  return (
    <header className={`topbar ${dark ? 'topbar--dark' : ''}`}>
      <Logo />
      <div className="topbar__actions" aria-hidden="true">
        <span>&#10019;</span>
        <span>&times;</span>
      </div>
    </header>
  );
}
