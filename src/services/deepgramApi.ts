import { AgentSessionConfig, AgentSettingsObject } from '@deepgram/agents';
import {
  InterviewEvaluation,
  FinishedInterview,
  InterviewTranscript,
  MockInterviewParams,
} from '../components/Interview/types';
import { IInterview, JsonObject } from '@/types';
import { getInterviewerInfo } from '@/constants';

const TOKEN_ENDPOINT = '/practice/get_dg_token';
const AGENT_BUILD_ENDPOINT = '/practice/get_agent_build';
const GET_INTERVIEW_ENDPOINT = '/practice/get_interview';
const UPLOAD_TRANSCRIPT_ENDPOINT = '/practice/upload_transcript';
const START_INTERVIEW_ENDPOINT = '/practice/start';
const EVALUATION_ENDPOINT = '/practice/evaluation';
const FINISH_INTERVIEW_ENDPOINT = '/practice/finish';

export interface AgentBuildConfig {
  agent: AgentSettingsObject | string;
  audio?: AgentSessionConfig['audio'];
  tags?: string[];
  experimental?: boolean;
}

async function request(endpoint: string, params?: object): Promise<unknown> {
  const backendUrl = __BACKEND_API_URL__.replace(/\/$/, '');
  const msId = localStorage.getItem("_ms-id")
  const response = await fetch(`${backendUrl}${endpoint}?ms_id=${msId}`, {
    method: 'POST',
    body: params ? JSON.stringify(params) : undefined,
    headers: {
      Accept: 'application/json',
      ...(params ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${endpoint} returned ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrap(value: unknown, keys: string[]): { code: number, status: number, msg: unknown } | null{
  if (!isObject(value)) return null;

  for (const key of keys) {
    if (value[key] !== undefined) return unwrap(value[key], keys);
  }

  return value as { code: number, status: number, msg: unknown };
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeAgent(agent: unknown): AgentSettingsObject | string {
  if (typeof agent === 'string' && agent.trim() !== '') return agent;
  if (!isObject(agent)) {
    throw new Error('The agent build does not contain a valid agent configuration.');
  }

  const normalizedAgent: JsonObject = { ...agent };
  const think = normalizedAgent.think;

  if (isObject(think) && isObject(think.provider)) {
    const { model, temperature, ...thinkSettings } = think;
    normalizedAgent.think = {
      ...thinkSettings,
      provider: {
        ...think.provider,
        ...(model !== undefined ? { model } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
      },
    };
  }

  return normalizedAgent as AgentSettingsObject;
}

export async function fetchDeepgramToken(interviewId?: number): Promise<string> {
  const res = await request(
    TOKEN_ENDPOINT,
    interviewId ? { interview_id: interviewId } : undefined,
  );

  const data = unwrap(res, ['data']);
  if (!data) throw new Error('Invalid response data.'); 
  if (data.code < 0) throw new Error(String(data.msg));

  const token = (data.msg as { access_token: string }).access_token;
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('The token endpoint did not return a valid temporary access token.');
  }

  return token;
}

export async function fetchAgentBuild(
  params: MockInterviewParams,
  interviewId: number,
): Promise<AgentBuildConfig> {
  const res = await request(AGENT_BUILD_ENDPOINT, {
    difficulty: params.difficulty,
    gender: getInterviewerInfo(params.interviewerIndex).gender,
    ...{ mi_id: interviewId },
  });
  const data = unwrap(res, ['data']);
  if (!data) throw new Error('Invalid response data.');
  if (data.code < 0) throw new Error(String(data.msg));

  const build = data.msg;
  if (typeof build === 'string') return { agent: normalizeAgent(build) };
  if (isObject(build) && build.agent !== undefined) {
    return {
      agent: normalizeAgent(build.agent),
      audio: build.audio as AgentSessionConfig['audio'],
      tags: Array.isArray(build.tags)
        ? build.tags.filter((tag): tag is string => typeof tag === 'string')
        : undefined,
      experimental: typeof build.experimental === 'boolean' ? build.experimental : undefined,
    };
  }
  if (isObject(build)) return { agent: normalizeAgent(build) };

  throw new Error('The agent build endpoint did not return an agent ID or configuration.');
}

export async function fetchInterview(
  interviewId: number,
): Promise<IInterview | null> {
  const res = await request(GET_INTERVIEW_ENDPOINT, { mi_id: interviewId });
  const data = unwrap(res, ['data']);

  if (!data) throw Error('Invalid response data.');
  if (data.code < 0) throw Error(String(data.msg));

  return data.msg as IInterview;
}

export async function uploadTranscript(
  interviewId: number,
  sessionId: string,
  transcript: InterviewTranscript[],
): Promise<{ added: boolean, transcript_count: number }> {
  if (transcript.length === 0) return { added: false, transcript_count: 0 };

  const res = await request(UPLOAD_TRANSCRIPT_ENDPOINT, {
    mi_id: interviewId,
    session_id: sessionId,
    transcript,
  });

  const data = unwrap(res, ['data']);
  if (!data) throw Error('Invalid response data.');
  if (data.code < 0) throw Error(String(data.msg));

  return data.msg as { added: boolean, transcript_count: number }
}

export async function notifyInterviewStarted(
  interviewId: number,
  sessionId: string,
): Promise<{ interview_id: number, session_id: string, status: string }> {
  const res = await request(START_INTERVIEW_ENDPOINT, {
    mi_id: interviewId,
    session_id: sessionId,
  });

  const data = unwrap(res, ['data']);
  if (!data) throw Error('Invalid response data.');
  if (data.code < 0) throw Error(String(data.msg));

  return data.msg as { interview_id: number, session_id: string, status: string }
}

export async function fetchEvaluation(
  interviewId: number,
  sessionId?: string,
): Promise<InterviewEvaluation> {
  const res = await request(EVALUATION_ENDPOINT, {
    mi_id: interviewId,
    ...(sessionId ? { session_id: sessionId } : {}),
  });
  const data = unwrap(res, ['data']);
  if (!data) throw new Error('Invalid response data.');
  if (data.code < 0) throw new Error(String(data.msg));

  const evaluation = data.msg;
  if (!isObject(evaluation) || !Array.isArray(evaluation.competencies)) {
    throw new Error('The evaluation endpoint returned an invalid report.');
  }

  return evaluation as unknown as InterviewEvaluation;
}

export async function finishInterview(
  interviewId: number,
  sessionId: string,
): Promise<FinishedInterview> {
  const res = await request(FINISH_INTERVIEW_ENDPOINT, {
    mi_id: interviewId,
    session_id: sessionId,
  });
  const data = unwrap(res, ['data']);

  if (!data) throw new Error('Invalid response data.');
  if (data.code < 0) throw new Error(String(data.msg));

  const result = data.msg;
  if (!isObject(result) || typeof result.report_available !== 'boolean') {
    throw new Error('The finish endpoint returned an invalid interview summary.');
  }

  return result as unknown as FinishedInterview;
}
