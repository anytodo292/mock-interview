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
        <span aria-hidden="true">
          {theme === 'dark' ? (
            <svg viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="3.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20">
              <path
                d="M16.8 12.6A7 7 0 0 1 7.4 3.2a7 7 0 1 0 9.4 9.4Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          )}
        </span>
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </header>
  );
}
