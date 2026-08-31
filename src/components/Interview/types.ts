export type Screen = 'home' | 'connecting' | 'live' | 'thinking' | 'finished' | 'report';

export type Theme = 'light' | 'dark';

export interface MockInterviewParams {
  scenario: number;
  language: number;
  difficulty: number;
}

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
