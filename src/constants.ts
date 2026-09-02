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

export interface Interviewer {
  language: number;
  name: string;
  anim: string;
  image: string;
}

export const InterviewerInfo: Interviewer[] = [
  {
    language: LangType.ENGLISH,
    name: 'Emma',
    anim: `${__PUBLIC_URL__}/assets/images/emma_en.gif`,
    image: `${__PUBLIC_URL__}/assets/images/emma_en.png`,
  },
  {
    language: LangType.DUTCH,
    name: 'Daan',
    anim: `${__PUBLIC_URL__}/assets/images/daan_nl.gif`,
    image: `${__PUBLIC_URL__}/assets/images/daan_nl.png`,
  },
  {
    language: LangType.FRENCH,
    name: 'Hector',
    anim: `${__PUBLIC_URL__}/assets/images/hector_fr.gif`,
    image: `${__PUBLIC_URL__}/assets/images/hector_fr.png`,
  },
  {
    language: LangType.GERMAN,
    name: 'Fabian',
    anim: `${__PUBLIC_URL__}/assets/images/fabian_de.gif`,
    image: `${__PUBLIC_URL__}/assets/images/fabian_de.png`,
  },
  {
    language: LangType.ITALIAN,
    name: 'Flavio',
    anim: `${__PUBLIC_URL__}/assets/images/falvio_it.gif`,
    image: `${__PUBLIC_URL__}/assets/images/falvio_it.png`,
  },
  {
    language: LangType.JAPANESE,
    name: 'Ebisu',
    anim: `${__PUBLIC_URL__}/assets/images/edius_ja.gif`,
    image: `${__PUBLIC_URL__}/assets/images/edius_ja.png`,
  },
  {
    language: LangType.SPANISH,
    name: 'Nestor',
    anim: `${__PUBLIC_URL__}/assets/images/nestor_es.gif`,
    image: `${__PUBLIC_URL__}/assets/images/nestor_es.png`,
  },
];

export function getInterviewerInfo(language: number): Interviewer {
  return (
    InterviewerInfo.find((interviewer) => interviewer.language === language) ?? InterviewerInfo[0]
  );
}
