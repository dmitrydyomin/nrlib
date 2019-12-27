export type ReqUser = {
  id: number;
  role: string;
  name: string;
};

export type ReqSession = {
  id?: number | null;
};

export interface UserRequest extends Express.Request {
  session?: ReqSession;
  user?: ReqUser;
}
