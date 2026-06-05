export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type PostStatus = "scheduled" | "published" | "draft";

export type ChannelConnection = {
  name: string;
  connected: boolean;
};
