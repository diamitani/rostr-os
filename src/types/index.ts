// ════════════════════════════════════════
// ROSTR OS — Type System
// Framework: ROSTR (PAL + NPAO + 4Ds + JTBD)
// ════════════════════════════════════════

// ── NPAO Priority Classification ──
export type NPAOClass = "N" | "A" | "P" | "O";

export const NPAO_LABELS: Record<NPAOClass, { label: string; color: string; description: string }> = {
  N: { label: "Necessity", color: "#ef4444", description: "Hard blocker — nothing downstream works without this" },
  A: { label: "Anxiety", color: "#f59e0b", description: "Unresolved friction that degrades quality" },
  P: { label: "Priority", color: "#3b82f6", description: "Core mission work — advance the objective" },
  O: { label: "Opportunity", color: "#10b981", description: "Optional growth — pursue when bandwidth allows" },
};

// ── 4Ds Lifecycle Phases ──
export type FourDsPhase = "PreD" | "D1" | "D2" | "D3" | "D4";

export const FOUR_DS_LABELS: Record<FourDsPhase, { label: string; color: string; dominantNPAO: NPAOClass }> = {
  PreD: { label: "Drafting", color: "#6b7280", dominantNPAO: "N" },
  D1: { label: "Design", color: "#8b5cf6", dominantNPAO: "P" },
  D2: { label: "Develop", color: "#3b82f6", dominantNPAO: "P" },
  D3: { label: "Deploy", color: "#ef4444", dominantNPAO: "N" },
  D4: { label: "Deliver", color: "#10b981", dominantNPAO: "O" },
};

// ── Task Status ──
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done" | "blocked";

// ── Project ──
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  phase: FourDsPhase;
  organization: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  is_archived: boolean;
  n_count: number;
  a_count: number;
  p_count: number;
  o_count: number;
}

// ── Task ──
export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  npao_class: NPAOClass;
  phase: FourDsPhase;
  status: TaskStatus;
  assignee: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  build_prompt: string | null;
  done_when: string | null;
  parent_task_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── Organization ──
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ── User Profile ──
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
}

// ── AI Intake (PAL) ──
export interface PALIntakeInput {
  raw_description: string;
  project_type?: string;
  reference_urls?: string[];
}

export interface PALIntakeOutput {
  project_name: string;
  description: string;
  phase: FourDsPhase;
  tasks: {
    title: string;
    description: string;
    npao_class: NPAOClass;
    phase: FourDsPhase;
    estimated_minutes: number;
    done_when: string;
    build_prompt: string;
  }[];
}

// ── Dashboard Stats ──
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  npao_breakdown: Record<NPAOClass, number>;
  phase_breakdown: Record<FourDsPhase, number>;
  tasks_by_day: { date: string; completed: number; created: number }[];
}
