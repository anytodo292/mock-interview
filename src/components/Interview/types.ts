export type Screen =
  'home' | 'connecting' | 'live' | 'thinking' | 'finished' | 'report' | 'invalid';

export type Theme = 'light' | 'dark';

export interface MockInterviewParams {
  scenario: number;
  language: number;
  difficulty: number;
}

export interface InterviewStartParams extends MockInterviewParams {
  interviewId?: string;
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
