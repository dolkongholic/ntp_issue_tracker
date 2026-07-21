"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { Nickname, Project } from "@/lib/types";

type ActivityMap = Record<Nickname, string | null>;

type AppDataContextValue = {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  reloadProjects: () => Promise<void>;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;

  activity: ActivityMap;
  reloadActivity: () => Promise<void>;
  bumpActivity: (author: Nickname, at: string) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const EMPTY_ACTIVITY: ActivityMap = { 딸기: null, 망고: null, 두리안: null };

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityMap>(EMPTY_ACTIVITY);

  const reloadProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      setProjects(await api.listProjects());
    } catch (err) {
      setProjectsError(
        err instanceof Error ? err.message : "불러오기에 실패했습니다."
      );
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const reloadActivity = useCallback(async () => {
    try {
      setActivity(await api.getActivity());
    } catch {
      // best-effort; sidebar simply shows stale activity on failure
    }
  }, []);

  useEffect(() => {
    reloadProjects();
    reloadActivity();
  }, [reloadProjects, reloadActivity]);

  const upsertProject = useCallback((project: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      const next = exists
        ? prev.map((p) => (p.id === project.id ? project : p))
        : [project, ...prev];
      return [...next].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const bumpActivity = useCallback((author: Nickname, at: string) => {
    setActivity((prev) => ({ ...prev, [author]: at }));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        projects,
        projectsLoading,
        projectsError,
        reloadProjects,
        upsertProject,
        removeProject,
        activity,
        reloadActivity,
        bumpActivity,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
