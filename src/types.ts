export type JsonObject = Record<string, unknown>;

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PostFormValues {
  idPost?: string;
  titlePost: string;
  bodyPost: string;
}

export interface RouteParams {
  id: string;
}

export interface IInterview extends JsonObject {
  li_id?: number;
  scenario: number;
  position: string;
  platform: number;
  lang: number;
  trans_lang: number;
  keywords: string[];
  company: string;
  start_at: string;
  cv: string;
  cv_id: string;
  instruct: string;
  jd: string;
  jd_url: string;
  proj_desc: string;
  proj_task: string;
  proj_progress: string;
  about_you: string;
  about_client: string;
  about_service: string;
  meet_target: string;
  call_type: number;
  link: string;
  favicon?: string;
  url?: string;
  trigger?: number;
  started?: boolean;
  autoable?: boolean;
  translable?: boolean;
  limit?: number;
  stt?: boolean;
  detail?: boolean;
  dg_key?: string;
  dg_model?: string;
  ocr_key?: string;
  aws_key?: string;
  credit_balance?: string;
  credit_cost?: string;
  transcript_count?: number;
  retriable?: boolean;
}

