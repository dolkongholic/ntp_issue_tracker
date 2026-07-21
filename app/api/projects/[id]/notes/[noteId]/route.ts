import { NextRequest, NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { logAction, logWarn } from "@/lib/logger";
import { NOTE_TAGS, type NoteTag } from "@/lib/types";

type Params = { params: Promise<{ id: string; noteId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, noteId } = await params;
  const body = await req.json().catch(() => null);
  const content =
    typeof body?.content === "string" ? body.content.trim() : undefined;
  const rawTag = body?.tag;
  const tag: NoteTag | null | undefined =
    rawTag === null ? null : NOTE_TAGS.includes(rawTag) ? rawTag : undefined;
  const actor = typeof body?.actor === "string" ? body.actor : null;

  if (content === "") {
    logWarn("PATCH", `/api/projects/${id}/notes/${noteId}`, {
      reason: "empty content",
      actor,
    });
    return NextResponse.json(
      { error: "content cannot be empty" },
      { status: 400 }
    );
  }

  const result = await mutateDb((db) => {
    const note = db.notes.find((n) => n.id === noteId && n.projectId === id);
    if (!note) return { status: "not-found" as const };
    if (note.author !== actor) return { status: "forbidden" as const };
    if (content !== undefined) note.content = content;
    if (tag !== undefined) note.tag = tag;
    return { status: "ok" as const, note };
  });

  if (result.status === "not-found") {
    logWarn("PATCH", `/api/projects/${id}/notes/${noteId}`, {
      reason: "not found",
      actor,
    });
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (result.status === "forbidden") {
    logWarn("PATCH", `/api/projects/${id}/notes/${noteId}`, {
      reason: "forbidden",
      actor,
    });
    return NextResponse.json(
      { error: "본인이 작성한 기록만 수정할 수 있습니다." },
      { status: 403 }
    );
  }

  logAction("PATCH", `/api/projects/${id}/notes/${noteId}`, actor, "update-note", {
    projectId: id,
    noteId,
  });

  return NextResponse.json({ note: result.note });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, noteId } = await params;
  const actor = req.nextUrl.searchParams.get("actor");

  const result = await mutateDb((db) => {
    const idx = db.notes.findIndex(
      (n) => n.id === noteId && n.projectId === id
    );
    if (idx === -1) return "not-found" as const;
    if (db.notes[idx].author !== actor) return "forbidden" as const;
    db.notes.splice(idx, 1);
    return "ok" as const;
  });

  if (result === "not-found") {
    logWarn("DELETE", `/api/projects/${id}/notes/${noteId}`, {
      reason: "not found",
      actor,
    });
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (result === "forbidden") {
    logWarn("DELETE", `/api/projects/${id}/notes/${noteId}`, {
      reason: "forbidden",
      actor,
    });
    return NextResponse.json(
      { error: "본인이 작성한 기록만 삭제할 수 있습니다." },
      { status: 403 }
    );
  }

  logAction("DELETE", `/api/projects/${id}/notes/${noteId}`, actor, "delete-note", {
    projectId: id,
    noteId,
  });

  return NextResponse.json({ ok: true });
}
