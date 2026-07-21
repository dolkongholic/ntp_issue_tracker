import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutateDb, withDb } from "@/lib/db";
import { logAccess, logAction, logWarn } from "@/lib/logger";
import { NICKNAMES, NOTE_TAGS, type Nickname, type NoteTag } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  logAccess("GET", `/api/projects/${id}/notes`);
  const notes = await withDb((db) =>
    db.notes
      .filter((n) => n.projectId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const author = body?.author as Nickname;
  const rawTag = body?.tag;
  const tag: NoteTag | null = NOTE_TAGS.includes(rawTag) ? rawTag : null;

  if (!content) {
    logWarn("POST", `/api/projects/${id}/notes`, { reason: "missing content" });
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (!NICKNAMES.includes(author)) {
    logWarn("POST", `/api/projects/${id}/notes`, {
      reason: "invalid author",
      author,
    });
    return NextResponse.json(
      { error: "valid author nickname is required" },
      { status: 400 }
    );
  }

  const result = await mutateDb((db) => {
    const project = db.projects.find((p) => p.id === id);
    if (!project) return null;

    const note = {
      id: randomUUID(),
      projectId: id,
      author,
      content,
      tag,
      createdAt: new Date().toISOString(),
    };
    db.notes.push(note);
    project.updatedAt = note.createdAt;
    return note;
  });

  if (!result) {
    logWarn("POST", `/api/projects/${id}/notes`, {
      reason: "project not found",
      author,
    });
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  logAction("POST", `/api/projects/${id}/notes`, author, "create-note", {
    projectId: id,
    noteId: result.id,
    tag: tag ?? undefined,
  });

  return NextResponse.json({ note: result }, { status: 201 });
}
