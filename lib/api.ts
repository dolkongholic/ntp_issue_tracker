import type { Nickname, Note, NoteTag, Project } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body?.error ?? `요청에 실패했습니다 (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProjects: () =>
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => handle<{ projects: Project[] }>(r))
      .then((d) => d.projects),

  createProject: (name: string, description: string, createdBy: Nickname) =>
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, createdBy }),
    })
      .then((r) => handle<{ project: Project }>(r))
      .then((d) => d.project),

  updateProject: (
    id: string,
    patch: { name?: string; description?: string },
    actor: Nickname
  ) =>
    fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, actor }),
    })
      .then((r) => handle<{ project: Project }>(r))
      .then((d) => d.project),

  deleteProject: (id: string, actor: Nickname) =>
    fetch(`/api/projects/${id}?actor=${encodeURIComponent(actor)}`, {
      method: "DELETE",
    }).then((r) => handle<{ ok: true }>(r)),

  getProject: (id: string) =>
    fetch(`/api/projects/${id}`, { cache: "no-store" })
      .then((r) => handle<{ project: Project }>(r))
      .then((d) => d.project),

  listNotes: (projectId: string) =>
    fetch(`/api/projects/${projectId}/notes`, { cache: "no-store" })
      .then((r) => handle<{ notes: Note[] }>(r))
      .then((d) => d.notes),

  createNote: (
    projectId: string,
    content: string,
    author: Nickname,
    tag: NoteTag | null
  ) =>
    fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author, tag }),
    })
      .then((r) => handle<{ note: Note }>(r))
      .then((d) => d.note),

  updateNote: (
    projectId: string,
    noteId: string,
    patch: { content?: string; tag?: NoteTag | null },
    actor: Nickname
  ) =>
    fetch(`/api/projects/${projectId}/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, actor }),
    })
      .then((r) => handle<{ note: Note }>(r))
      .then((d) => d.note),

  deleteNote: (projectId: string, noteId: string, actor: Nickname) =>
    fetch(
      `/api/projects/${projectId}/notes/${noteId}?actor=${encodeURIComponent(actor)}`,
      { method: "DELETE" }
    ).then((r) => handle<{ ok: true }>(r)),

  getActivity: () =>
    fetch("/api/activity", { cache: "no-store" })
      .then((r) => handle<{ activity: Record<Nickname, string | null> }>(r))
      .then((d) => d.activity),
};
