import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutateDb, withDb } from "@/lib/db";
import { logAccess, logAction, logWarn } from "@/lib/logger";
import { NICKNAMES, type Nickname } from "@/lib/types";

export async function GET() {
  logAccess("GET", "/api/projects");
  const projects = await withDb((db) =>
    [...db.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  );
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const createdBy = body?.createdBy as Nickname;

  if (!name) {
    logWarn("POST", "/api/projects", { reason: "missing name" });
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!NICKNAMES.includes(createdBy)) {
    logWarn("POST", "/api/projects", { reason: "invalid createdBy", createdBy });
    return NextResponse.json(
      { error: "valid createdBy nickname is required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const project = {
    id: randomUUID(),
    name,
    description,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  await mutateDb((db) => {
    db.projects.push(project);
  });

  logAction("POST", "/api/projects", createdBy, "create-project", {
    projectId: project.id,
    name: project.name,
  });

  return NextResponse.json({ project }, { status: 201 });
}
