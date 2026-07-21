"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { AppDataProvider } from "@/lib/app-data";
import { useNickname } from "@/lib/use-nickname";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { nickname, loaded } = useNickname();

  useEffect(() => {
    if (loaded && !nickname) router.replace("/");
  }, [loaded, nickname, router]);

  if (!loaded || !nickname) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <AppDataProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <Header />
          <div className="w-full px-8 py-8 lg:px-12 lg:py-10">{children}</div>
        </main>
      </div>
    </AppDataProvider>
  );
}
