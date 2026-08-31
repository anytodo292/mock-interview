export type Screen = 'home' | 'connecting' | 'live' | 'finished'; //| 'thinking'  | 'report'

export type Theme = 'light' | 'dark';

export interface ScreenDefinition {
  id: Screen;
  label: string;
}

export interface CallControlsProps {
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  onMute: () => void;
  onPause: () => void;
}
