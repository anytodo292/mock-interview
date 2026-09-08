export type Screen =
  | 'home'
  | 'connecting'
  | 'live'
  | 'thinking'
  | 'finished'
  | 'report'
  | 'invalid'
  | 'install-extension'
  | 'loading';

export type Theme = 'light' | 'dark';

export interface MockInterviewParams {
  scenario: number;
  language: number;
  difficulty: number;
  interviewerIndex: number;
}

export interface InterviewStartParams extends MockInterviewParams {
  msId: string;
  interviewId: number;
}

export interface InterviewTranscript {
  id?: number;
  speaker: 'interviewer' | 'you';
  talk: string;
  capturedAt: string;
}

export interface EvaluationCompetency {
  name: string;
  score: number;
}

export interface InterviewEvaluation {
  interview_id: number;
  scenario: number;
  difficulty: number;
  duration_seconds: number;
  overall_score: number;
  competencies: EvaluationCompetency[];
  strengths: string[];
  areas_to_improve: string[];
  suggested_learning: string[];
  ai_feedback: string[];
  transcript: InterviewTranscript[];
  generated_at: string;
}

export interface FinishedInterview {
  interview_id: number;
  scenario: number;
  difficulty: number;
  duration_seconds: number;
  status: number;
  overall_score: number;
  report_available: boolean;
}

export interface ScreenDefinition {
  id: Screen;
  label: string;
}

export interface CallControlsProps {
  onEnd: () => void;
  muted: boolean;
  paused: boolean;
  disabled?: boolean;
  onMute: () => void;
  onPause: () => void;
}
