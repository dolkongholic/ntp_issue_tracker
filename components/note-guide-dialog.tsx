"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NOTE_TAGS } from "@/lib/types";

const PROMPT_TEMPLATE = `아래는 오늘 진행한 작업 내용이야. 다음 형식에 맞춰 깔끔하게 정리해줘:

1. 오늘 한 일 (한 줄 요약)
2. 상세 내용 (무엇을 / 왜 / 어떻게)
3. 결과 또는 다음 할 일

[오늘 작업 내용]
(여기에 오늘 한 작업을 자유롭게 적어줘)`;

const EXAMPLE_NOTE = `1. 프로젝트 목록 검색 기능 추가
2. 프로젝트가 많아지면 원하는 걸 찾기 어렵다는 피드백이 있어서, 헤더에 검색창을 추가하고 이름/설명 기준으로 실시간 필터링되도록 구현함
3. 대시보드에서 바로 검색 가능. 다음엔 최근 조회한 프로젝트 목록도 추가 예정`;

type NoteGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NoteGuideDialog({ open, onOpenChange }: NoteGuideDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; user can still select the text manually
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>히스토리 작성 가이드</DialogTitle>
          <DialogDescription>
            팀원 모두가 같은 형식으로 기록을 남길 수 있도록, 아래 템플릿을
            AI에게 붙여넣고 오늘 한 작업을 이어서 적어주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">작성 규칙</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>무엇을 / 왜 / 어떻게 했는지 순서로 적어요.</li>
            <li>결과나 다음에 할 일까지 한 줄로 남겨요.</li>
            <li>
              태그는 {NOTE_TAGS.join(", ")} 중 가장 가까운 하나만 선택해요.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">작성 예시</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-3 text-xs text-foreground/90">
            {EXAMPLE_NOTE}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">AI 프롬프트 템플릿</p>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-3 text-xs text-foreground/90">
            {PROMPT_TEMPLATE}
          </pre>
          <p className="text-xs text-muted-foreground">
            &quot;오늘 이런 작업을 했는데 이 내용대로 정리해줘&quot; 라고
            AI에게 붙여넣고, 아래 정리된 결과를 기록란에 옮겨 적으면 돼요.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "복사됨" : "템플릿 복사"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
