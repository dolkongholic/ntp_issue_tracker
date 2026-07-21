"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { NoteGuideDialog } from "@/components/note-guide-dialog";
import { NoteWriteDialog } from "@/components/note-write-dialog";
import { api, ApiError } from "@/lib/api";
import { useNickname } from "@/lib/use-nickname";
import { useAppData } from "@/lib/app-data";
import { NICKNAME_THEME } from "@/lib/nickname-theme";
import { dateGroupLabel, dateKey, formatTime } from "@/lib/format";
import type { Note, NoteTag, Project } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const router = useRouter();
  const { nickname } = useNickname();
  const { upsertProject, removeProject, bumpActivity } = useAppData();

  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [deletingNoteBusy, setDeletingNoteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [p, n] = await Promise.all([
        api.getProject(projectId),
        api.listNotes(projectId),
      ]);
      setProject(p);
      setNotes(n);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : "불러오기에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const todayCount = useMemo(() => {
    const today = dateKey(new Date().toISOString());
    return notes.filter((n) => dateKey(n.createdAt) === today).length;
  }, [notes]);

  const openCreateNote = () => {
    setEditingNote(null);
    setNoteDialogOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleSubmitNote = async (content: string, tag: NoteTag | null) => {
    if (!nickname || !project) return;
    if (editingNote) {
      const updated = await api.updateNote(
        projectId,
        editingNote.id,
        { content, tag },
        nickname
      );
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } else {
      const note = await api.createNote(projectId, content, nickname, tag);
      setNotes((prev) => [note, ...prev]);
      upsertProject({ ...project, updatedAt: note.createdAt });
      bumpActivity(nickname, note.createdAt);
    }
  };

  const confirmDeleteNote = async () => {
    if (!deletingNote || !nickname) return;
    setDeletingNoteBusy(true);
    try {
      await api.deleteNote(projectId, deletingNote.id, nickname);
      setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
      setDeletingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeletingNoteBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!project || !nickname) return;
    setDeleting(true);
    try {
      await api.deleteProject(project.id, nickname);
      removeProject(project.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">불러오는 중...</p>;
  }

  if (notFound || !project) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          프로젝트를 찾을 수 없습니다.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft />
          대시보드로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <div
          data-slot="button-group"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/30 p-1"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft />
            대시보드로 이동
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil />
            프로젝트 수정
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            프로젝트 삭제
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
        <Card className="gap-1 p-4">
          <p className="text-xs text-muted-foreground">총 기록</p>
          <p className="text-2xl font-semibold tabular-nums">{notes.length}</p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-xs text-muted-foreground">오늘 기록</p>
          <p className="text-2xl font-semibold tabular-nums">{todayCount}</p>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            타임라인
          </h2>
          <Button type="button" size="sm" onClick={openCreateNote}>
            <Plus />
            작성하기
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 기록이 없습니다. 첫 기록을 남겨보세요.
          </p>
        ) : (
          <ol className="relative flex flex-col gap-5">
            <div
              aria-hidden
              className="absolute top-1 bottom-1 left-4 w-px bg-border"
            />
            {notes.map((note, idx) => {
              const theme = NICKNAME_THEME[note.author];
              const isMine = note.author === nickname;
              const showDateHeader =
                idx === 0 ||
                dateKey(note.createdAt) !== dateKey(notes[idx - 1].createdAt);

              return (
                <li key={note.id} className="relative pl-11">
                  {showDateHeader && (
                    <p className="relative z-10 mb-2 text-xs font-medium text-muted-foreground">
                      {dateGroupLabel(note.createdAt)}
                    </p>
                  )}
                  <span
                    className={`absolute left-4 top-1.5 z-10 size-3 -translate-x-1/2 rounded-full ring-4 ring-background ${theme.dot}`}
                    aria-hidden
                  />
                  <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${theme.text}`}>
                        {note.author}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(note.createdAt)}
                        </span>
                        {isMine && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openEditNote(note)}
                            >
                              <Pencil />
                              <span className="sr-only">기록 수정</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingNote(note)}
                            >
                              <Trash2 />
                              <span className="sr-only">기록 삭제</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {note.tag && (
                      <Badge variant="secondary" className="mt-1.5">
                        {note.tag}
                      </Badge>
                    )}
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">
                      {note.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <NoteGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />

      {nickname && (
        <NoteWriteDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          nickname={nickname}
          note={editingNote}
          onSubmit={handleSubmitNote}
          onOpenGuide={() => setGuideOpen(true)}
        />
      )}

      <AlertDialog
        open={!!deletingNote}
        onOpenChange={(open) => !open && setDeletingNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              이 기록은 되돌릴 수 없이 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deletingNoteBusy}
              onClick={confirmDeleteNote}
            >
              {deletingNoteBusy ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        onSubmit={async (values) => {
          if (!nickname) return;
          const updated = await api.updateProject(project.id, values, nickname);
          setProject(updated);
          upsertProject(updated);
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{project.name}&quot; 프로젝트와 모든 기록이 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
