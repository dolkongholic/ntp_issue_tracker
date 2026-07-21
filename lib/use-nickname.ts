"use client";

import { useCallback, useEffect, useState } from "react";
import { NICKNAMES, type Nickname } from "./types";

const STORAGE_KEY = "tracker:nickname";

function isNickname(value: string | null): value is Nickname {
  return !!value && (NICKNAMES as readonly string[]).includes(value);
}

export function useNickname() {
  const [nickname, setNicknameState] = useState<Nickname | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isNickname(stored)) setNicknameState(stored);
    setLoaded(true);
  }, []);

  const setNickname = useCallback((next: Nickname) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setNicknameState(next);
  }, []);

  const clearNickname = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setNicknameState(null);
  }, []);

  return { nickname, setNickname, clearNickname, loaded };
}
