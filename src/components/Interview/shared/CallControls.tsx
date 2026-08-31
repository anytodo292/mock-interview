import React from 'react';

import { CallControlsProps } from '../types';

export function CallControls({
  onEnd,
  muted,
  paused,
  onMute,
  onPause,
}: CallControlsProps): JSX.Element {
  return (
    <div className="call-controls">
      <button type="button" className={muted ? 'active' : ''} aria-pressed={muted} onClick={onMute}>
        <span>{muted ? '♪' : '♩'}</span>
        <small>{muted ? 'Unmute' : 'Mute'}</small>
      </button>
      <button
        type="button"
        className={paused ? 'active' : ''}
        aria-pressed={paused}
        onClick={onPause}
      >
        <span>{paused ? '▶' : 'Ⅱ'}</span>
        <small>{paused ? 'Resume' : 'Pause'}</small>
      </button>
      <button type="button" className="call-controls__end" onClick={onEnd}>
        <span>⌕</span>
        <small>End</small>
      </button>
    </div>
  );
}
