export const InterviewType = {
  // QUICK_CALL: -1,
  TECH_INTERVIEW: 0,
  // HR_INTERVIEW: 1,
  TEAM_MEETING: 2,
  CLIENT_MEETING: 3,
  CONSULTING: 4,
  CASUAL_CONVERSATION: 5,
  // ONLINE_ASSESSMENT: 6,

  SCREENING_INTERVIEW: 7,
  CODING_INTERVIEW: 8,
  SYS_DESGIN_INTERVIEW: 9,
  BEHAV_INTERVIEW: 10,
  CASE_INTERVIEW: 11,
  SITUATION_INTERVIEW: 12,
  CULTURE_INTERVIEW: 13,
  FINAL_INTERVIEW: 14,
  AI_INTERVIEW: 15,
};

export const LangType = {
  CHINESE: 0,
  DUTCH: 1,
  ENGLISH: 2,
  FRENCH: 3,
  GERMAN: 4,
  ITALIAN: 5,
  JAPANESE: 6,
  SPANISH: 7,
  RUSSIAN: 8,
  ARABIC: 9,
  PORTUGUESE: 10,
  KOREAN: 11,
};

export const DifficultyType = {
  Junior: 0,
  Mid: 1,
  Senior: 2,
};

// Change this value to adjust the maximum active interview duration.
export const MAX_INTERVIEW_DURATION_SECONDS = 20 * 60;

export const InterviewStatusType = {
  Ready: 0,
  Active: 1,
  Finished: 2,
  Evaluating: 3,
  Complete: 4,
  Failed: 5,
} as const;

export const InterviewStatusLabels: Record<number, string> = {
  [InterviewStatusType.Ready]: 'Ready',
  [InterviewStatusType.Active]: 'Active',
  [InterviewStatusType.Finished]: 'Finished',
  [InterviewStatusType.Evaluating]: 'Evaluating',
  [InterviewStatusType.Complete]: 'Complete',
  [InterviewStatusType.Failed]: 'Failed',
};

export const InterviewTypeList: { id: number; text: string }[] = [
  { id: InterviewType.SCREENING_INTERVIEW, text: 'Screening Interview' },
  { id: InterviewType.TECH_INTERVIEW, text: 'Technical Interview' },
  { id: InterviewType.CODING_INTERVIEW, text: 'Coding Interview' },
  { id: InterviewType.SYS_DESGIN_INTERVIEW, text: 'System Design Interview' },
  { id: InterviewType.BEHAV_INTERVIEW, text: 'Behavioral Interview' },
  { id: InterviewType.CASE_INTERVIEW, text: 'Case Interview' },
  { id: InterviewType.SITUATION_INTERVIEW, text: 'Situational Interview' },
  { id: InterviewType.CULTURE_INTERVIEW, text: 'Culture Fit Interview' },
  { id: InterviewType.FINAL_INTERVIEW, text: 'Hiring Manager Interview' },
  { id: InterviewType.AI_INTERVIEW, text: 'AI-Driven Interview' },
  { id: InterviewType.TEAM_MEETING, text: 'Team Meeting' },
  { id: InterviewType.CLIENT_MEETING, text: 'Client Meeting' },
  { id: InterviewType.CONSULTING, text: 'Consultation Meeting' },
  { id: InterviewType.CASUAL_CONVERSATION, text: 'Casual Conversation' },
  // { id: InterviewType.ONLINE_ASSESSMENT, text: 'Online Assessment' },
];

export const LangTypeList = [
  { id: LangType.DUTCH, country: 'Dutch (Nederlands)', deepgramCode: 'nl' },
  { id: LangType.ENGLISH, country: 'English (US)', deepgramCode: 'en' },
  { id: LangType.FRENCH, country: 'French (Français)', deepgramCode: 'fr' },
  { id: LangType.GERMAN, country: 'German (Deutsch)', deepgramCode: 'de' },
  { id: LangType.ITALIAN, country: 'Italian (Italiano)', deepgramCode: 'it' },
  { id: LangType.JAPANESE, country: 'Japanese (日本語)', deepgramCode: 'ja' },
  { id: LangType.SPANISH, country: 'Spanish (Español)', deepgramCode: 'es' },
];

export const DifficultyTypeList: { id: number; text: string }[] = [
  { id: DifficultyType.Junior, text: 'Junior' },
  { id: DifficultyType.Mid, text: 'Mid-Level' },
  { id: DifficultyType.Senior, text: 'Senior' },
];

export interface Interviewer {
  gender: 'm' | 'f';
  name: string;
  anim_speak: string;
  anim_listen: string;
  image: string;
}

export const InterviewerInfo: Interviewer[] = [
  {
    name: 'Emma',
    gender: 'f',
    anim_speak: `${__PUBLIC_URL__}/assets/images/emma_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/emma_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/emma.png`,
  },
  {
    name: 'Daan',
    gender: 'm',
    anim_speak: `${__PUBLIC_URL__}/assets/images/daan_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/daan_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/daan.png`,
  },
  {
    name: 'Hector',
    gender: 'f',
    anim_speak: `${__PUBLIC_URL__}/assets/images/hector_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/hector_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/hector.png`,
  },
  {
    name: 'Fabian',
    gender: 'm',
    anim_speak: `${__PUBLIC_URL__}/assets/images/fabian_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/fabian_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/fabian.png`,
  },
  {
    name: 'Flavio',
    gender: 'm',
    anim_speak: `${__PUBLIC_URL__}/assets/images/falvio_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/falvio_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/falvio.png`,
  },
  {
    name: 'Ebisu',
    gender: 'f',
    anim_speak: `${__PUBLIC_URL__}/assets/images/ebius_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/ebius_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/ebius.png`,
  },
  {
    name: 'Nestor',
    gender: 'm',
    anim_speak: `${__PUBLIC_URL__}/assets/images/nestor_speak.gif`,
    anim_listen: `${__PUBLIC_URL__}/assets/images/nestor_listen.gif`,
    image: `${__PUBLIC_URL__}/assets/images/nestor.png`,
  },
];

export function getInterviewerInfo(selectedIndex: number): Interviewer {
  return InterviewerInfo[selectedIndex] ?? InterviewerInfo[0];
}
