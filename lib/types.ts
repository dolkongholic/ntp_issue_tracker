export const NICKNAMES = ["딸기", "망고", "두리안"] as const;
export type Nickname = (typeof NICKNAMES)[number];

export const NOTE_TAGS = ["기능개발", "디자인", "버그수정", "기타"] as const;
export type NoteTag = (typeof NOTE_TAGS)[number];

export type Project = {
  id: string;
  name: string;
  description: string;
  createdBy: Nickname;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  projectId: string;
  author: Nickname;
  content: string;
  tag: NoteTag | null;
  createdAt: string;
};

export type Database = {
  projects: Project[];
  notes: Note[];
};
