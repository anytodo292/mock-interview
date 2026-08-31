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
