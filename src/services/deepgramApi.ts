import { AgentSessionConfig, AgentSettingsObject } from '@deepgram/agents';
import { MockInterviewParams } from '../components/Interview/types';

const TOKEN_ENDPOINT = '/agent/get_dg_token';
const AGENT_BUILD_ENDPOINT = '/agent/get_agent_build';

type JsonObject = Record<string, unknown>;

export interface AgentBuildConfig {
  agent: AgentSettingsObject | string;
  audio?: AgentSessionConfig['audio'];
  tags?: string[];
  experimental?: boolean;
}

async function postJson(endpoint: string, params?: object): Promise<unknown> {
  const backendUrl = __BACKEND_API_URL__.replace(/\/$/, '');
  const response = await fetch(`${backendUrl}${endpoint}`, {
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

function unwrap(value: unknown, keys: string[]): unknown {
  if (!isObject(value)) return value;

  for (const key of keys) {
    if (value[key] !== undefined) return unwrap(value[key], keys);
  }

  return value;
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

export async function fetchDeepgramToken(): Promise<string> {
  const payload = await postJson(TOKEN_ENDPOINT);
  const token = unwrap(payload, ['data', 'msg', 'access_token']);

  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('The token endpoint did not return a valid temporary access token.');
  }

  return token;
}

export async function fetchAgentBuild(params: MockInterviewParams): Promise<AgentBuildConfig> {
  const payload = await postJson(AGENT_BUILD_ENDPOINT, params);
  const build = unwrap(payload, ['data', 'msg']);

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
