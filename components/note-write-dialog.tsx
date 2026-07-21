"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_TAGS, type Nickname, type Note, type NoteTag } from "@/lib/types";

type NoteWriteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nickname: Nickname;
  note?: Note | null;
  onSubmit: (content: string, tag: NoteTag | null) => Promise<void>;
  onOpenGuide: () => void;
};

export function NoteWriteDialog({
  open,
  onOpenChange,
  nickname,
  note,
  onSubmit,
  onOpenGuide,
}: NoteWriteDialogProps) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<NoteTag | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!note;

  useEffect(() => {
    if (open) {
      setContent(note?.content ?? "");
      setTag(note?.tag ?? null);
      setError(null);
    }
  }, [open, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(content.trim(), tag);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader className="pr-10">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>{isEditing ? "기록 수정" : "오늘 무엇을 했나요?"}</DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="shrink-0"
                onClick={onOpenGuide}
              >
                작성 가이드
              </Button>
            </div>
            <DialogDescription>
              {nickname}(으)로 기록이 저장됩니다.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`${nickname}(으)로 기록을 남깁니다...`}
            rows={5}
            autoFocus
          />

          <div className="flex flex-wrap gap-1.5">
            {NOTE_TAGS.map((t) => (
              <Button
                key={t}
                type="button"
                variant={tag === t ? "default" : "outline"}
                size="xs"
                onClick={() => setTag((prev) => (prev === t ? null : t))}
              >
                {t}
              </Button>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={saving || !content.trim()}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
