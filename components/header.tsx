"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useAppData();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-8 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-12">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="프로젝트 검색..."
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
          >
            <X />
            <span className="sr-only">검색어 지우기</span>
          </Button>
        )}
      </div>
    </header>
  );
}
