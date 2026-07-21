import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { logAccess } from "@/lib/logger";
import { NICKNAMES, type Nickname } from "@/lib/types";

export async function GET() {
  logAccess("GET", "/api/activity");
  const activity = await withDb((db) => {
    const map: Record<Nickname, string | null> = {
      딸기: null,
      망고: null,
      두리안: null,
    };
    for (const note of db.notes) {
      const current = map[note.author];
      if (!current || note.createdAt > current) {
        map[note.author] = note.createdAt;
      }
    }
    return map;
  });

  return NextResponse.json({ activity });
}
