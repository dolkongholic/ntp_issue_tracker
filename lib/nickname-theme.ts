import type { Nickname } from "./types";

type NicknameTheme = {
  initial: string;
  text: string;
  bg: string;
  ring: string;
  dot: string;
};

// Each nickname gets its own accent (fruit-matched) so authors are easy to
// tell apart at a glance; kept at moderate saturation to sit well in the
// dark theme rather than reading as a rainbow.
export const NICKNAME_THEME: Record<Nickname, NicknameTheme> = {
  딸기: {
    initial: "딸",
    text: "text-rose-400",
    bg: "bg-rose-500/15",
    ring: "ring-rose-500/30",
    dot: "bg-rose-500",
  },
  망고: {
    initial: "망",
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    ring: "ring-amber-500/30",
    dot: "bg-amber-500",
  },
  두리안: {
    initial: "두",
    text: "text-lime-400",
    bg: "bg-lime-500/15",
    ring: "ring-lime-500/30",
    dot: "bg-lime-500",
  },
};
