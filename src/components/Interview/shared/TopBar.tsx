import React from 'react';
import { useTheme } from './ThemeContext';

function Logo(): JSX.Element {
  return (
    <div className="brand">
      <span className="brand__mark">N</span>
      <span>NTRO Copilot</span>
    </div>
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
