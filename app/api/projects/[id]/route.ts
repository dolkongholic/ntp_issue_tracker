import { NextRequest, NextResponse } from "next/server";
import { mutateDb, withDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = await withDb((db) =>
    db.projects.find((p) => p.id === id)
  );
  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const description =
    typeof body?.description === "string" ? body.description.trim() : undefined;

  if (name === "") {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const project = await mutateDb((db) => {
    const target = db.projects.find((p) => p.id === id);
    if (!target) return null;
    if (name !== undefined) target.name = name;
    if (description !== undefined) target.description = description;
    target.updatedAt = new Date().toISOString();
    return target;
  });

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const deleted = await mutateDb((db) => {
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    db.projects.splice(idx, 1);
    db.notes = db.notes.filter((n) => n.projectId !== id);
    return true;
  });

  if (!deleted) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
