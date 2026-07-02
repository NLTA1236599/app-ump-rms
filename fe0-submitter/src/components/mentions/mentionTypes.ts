export type MentionCandidate = {
  id: string;
  username: string;
  label: string;
  role: string;
};

export type ActiveMentionQuery = {
  query: string;
  startIndex: number;
};
