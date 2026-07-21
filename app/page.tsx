"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NICKNAMES, type Nickname } from "@/lib/types";
import { useNickname } from "@/lib/use-nickname";
import { NICKNAME_THEME } from "@/lib/nickname-theme";

export default function NicknameSelectPage() {
  const router = useRouter();
  const { nickname, setNickname, clearNickname, loaded } = useNickname();

  const choose = (name: Nickname) => {
    setNickname(name);
    router.push("/dashboard");
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          누구로 접속할까요?
        </h1>
        <p className="text-sm text-muted-foreground">
          닉네임을 선택하면 대시보드로 이동합니다.
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {NICKNAMES.map((name) => {
          const theme = NICKNAME_THEME[name];
          return (
            <Card
              key={name}
              onClick={() => choose(name)}
              className="cursor-pointer items-center gap-3 border-border bg-card p-6 text-center transition-colors hover:border-primary hover:bg-accent"
            >
              <div
                className={`flex size-14 items-center justify-center rounded-full text-lg font-semibold ${theme.bg} ${theme.text}`}
              >
                {theme.initial}
              </div>
              <div className="text-base font-medium">{name}</div>
            </Card>
          );
        })}
      </div>

      {loaded && nickname && (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p>
            마지막으로 <span className="text-foreground">{nickname}</span>
            (으)로 접속했었어요.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => router.push("/dashboard")}>
              {nickname}(으)로 계속하기
            </Button>
            <Button size="sm" variant="ghost" onClick={clearNickname}>
              초기화
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
