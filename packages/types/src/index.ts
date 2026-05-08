export type User = {
  id: string;
  name: string;
};

export type HelpRequest = {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
};

export type Response = {
  id: string;
  helpRequestId: string;
  body: string;
  authorId: string;
};
