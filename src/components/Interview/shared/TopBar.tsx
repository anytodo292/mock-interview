import React from 'react';
import { useTheme } from './ThemeContext';

function Logo(): JSX.Element {
  return (
    <a className="brand" href="https://www.ntro.io" aria-label="Visit NTRO">
      <img
        className="brand__logo"
        src={`${__PUBLIC_URL__}/assets/images/logo.png`}
        alt="NTRO Copilot"
      />
    </a>
  );
}

export function TopBar({ dark = false }: { dark?: boolean }): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`topbar ${dark ? 'topbar--dark' : ''}`}>
      <Logo />
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </header>
  );
}
