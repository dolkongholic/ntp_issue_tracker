"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectDialog } from "@/components/project-dialog";
import { api } from "@/lib/api";
import { useAppData } from "@/lib/app-data";
import { useNickname } from "@/lib/use-nickname";
import { relativeTime } from "@/lib/format";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { nickname } = useNickname();
  const {
    projects,
    filteredProjects,
    projectsLoading,
    projectsError,
    upsertProject,
    removeProject,
    searchQuery,
  } = useAppData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const openEdit = (project: Project) => {
    setEditing(project);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    if (!editing || !nickname) return;
    const updated = await api.updateProject(editing.id, values, nickname);
    upsertProject(updated);
  };

  const confirmDelete = async () => {
    if (!deleting || !nickname) return;
    await api.deleteProject(deleting.id, nickname);
    removeProject(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">프로젝트</h1>
        <p className="text-sm text-muted-foreground">
          프로젝트를 만들고 팀과 진행 기록을 공유하세요.
        </p>
      </div>

      {projectsError && (
        <p className="text-sm text-destructive">{projectsError}</p>
      )}

      {projectsLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : projects.length === 0 ? (
        <Card className="items-center gap-1 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 프로젝트가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            왼쪽 &quot;새 프로젝트&quot; 버튼으로 시작해 보세요.
          </p>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="items-center gap-1 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            &quot;{searchQuery}&quot;와 일치하는 프로젝트가 없습니다.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => router.push(`/dashboard/${project.id}`)}
            >
              <CardHeader>
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-10">
                  {project.description || "설명이 없습니다."}
                </CardDescription>
                <CardAction
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(project)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(project)}
                  >
                    <Trash2 />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                <span>만든이 {project.createdBy}</span>
                <span>{relativeTime(project.updatedAt)}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name}&quot; 프로젝트와 모든 기록이 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
