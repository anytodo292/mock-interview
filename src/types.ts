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
  mi_id?: number;
  status?: number;
  scenario: number;
  position: string;
  platform: number;
  lang: number;
  company: string;
  cv: string;
  cv_id: string;
  jd: string;
  jd_url: string;
  proj_desc: string;
  proj_task: string;
  proj_progress: string;
  about_you: string;
  about_client: string;
  about_service: string;
  meet_target: string;
  link: string;
  favicon?: string;
  transcript_list: []
  transcript_count?: number;
  evaluation?: any
}

