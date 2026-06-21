import { create } from "zustand";
import type { Project, Task, DashboardStats, NPAOClass, FourDsPhase } from "@/types";

// ── Project Store ──
interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  selectProject: (project: Project | null) => void;
  updateProjectPhase: (id: string, phase: FourDsPhase) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  selectProject: (project) => set({ selectedProject: project }),
  updateProjectPhase: (id, phase) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, phase } : p)),
    })),
}));

// ── Task Store ──
interface TaskStore {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, npao_class: NPAOClass) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  moveTask: (id, npao_class) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, npao_class } : t)),
    })),
}));

// ── Dashboard Store ──
interface DashboardStore {
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));

// ── UI Store ──
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
