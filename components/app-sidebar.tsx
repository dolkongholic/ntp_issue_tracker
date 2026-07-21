"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProjectDialog } from "@/components/project-dialog";
import { useNickname } from "@/lib/use-nickname";
import { useAppData } from "@/lib/app-data";
import { relativeTime } from "@/lib/format";
import { NICKNAME_THEME } from "@/lib/nickname-theme";
import { api } from "@/lib/api";
import { NICKNAMES } from "@/lib/types";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { nickname, clearNickname } = useNickname();
  const { projects, projectsLoading, activity, upsertProject } = useAppData();

  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = async (values: {
    name: string;
    description: string;
  }) => {
    if (!nickname) return;
    const project = await api.createProject(
      values.name,
      values.description,
      nickname
    );
    upsertProject(project);
    router.push(`/dashboard/${project.id}`);
  };

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border bg-card/40">
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          nativeButton={false}
          className="w-full justify-start px-2 text-base font-semibold tracking-tight"
          render={<Link href="/dashboard" />}
        >
          Issue Tracker
        </Button>
      </div>

      {nickname && (
        <div className="mx-5 flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${NICKNAME_THEME[nickname].bg} ${NICKNAME_THEME[nickname].text}`}
            >
              {NICKNAME_THEME[nickname].initial}
            </div>
            <span className="truncate text-sm font-medium">{nickname}</span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="min-w-0 px-2"
            onClick={() => {
              clearNickname();
              router.push("/");
            }}
          >
            변경
          </Button>
        </div>
      )}

      <div className="mt-6 px-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          팀원 현황
        </p>
        <ul className="flex flex-col gap-1.5">
          {NICKNAMES.map((name) => {
            const theme = NICKNAME_THEME[name];
            const lastAt = activity[name];
            return (
              <li
                key={name}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
              >
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${theme.bg} ${theme.text}`}
                >
                  {theme.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {name}
                    {name === nickname && (
                      <span className="text-muted-foreground"> (나)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lastAt ? `최근 활동 ${relativeTime(lastAt)}` : "아직 기록 없음"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Separator className="mt-5" />

      <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          프로젝트 목록
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {projectsLoading ? (
            <p className="px-2 text-xs text-muted-foreground">불러오는 중...</p>
          ) : projects.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">
              아직 프로젝트가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {projects.map((project) => {
                const active = pathname === `/dashboard/${project.id}`;
                return (
                  <li key={project.id}>
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className={`h-auto w-full min-w-0 justify-start px-2.5 py-2 text-left text-sm font-normal ${
                        active
                          ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
                          : "text-foreground/80"
                      }`}
                      render={<Link href={`/dashboard/${project.id}`} />}
                    >
                      <span className="truncate">{project.name}</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Button
          variant="outline"
          className="mt-3 w-full justify-center"
          onClick={() => setCreateOpen(true)}
        >
          <Plus />
          새 프로젝트
        </Button>
      </div>

      <ProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        project={null}
        onSubmit={handleCreate}
      />
    </aside>
  );
}
