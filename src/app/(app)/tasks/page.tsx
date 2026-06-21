"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn, npaoColor } from "@/lib/utils";
import type { Task, NPAOClass, TaskStatus } from "@/types";
import { CheckSquare, Clock, Filter } from "lucide-react";

const NPAO_COLUMNS: { cls: NPAOClass; label: string }[] = [
  { cls: "N", label: "Necessity" },
  { cls: "A", label: "Anxiety" },
  { cls: "P", label: "Priority" },
  { cls: "O", label: "Opportunity" },
];

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-zinc-500/20 text-zinc-400",
  todo: "bg-zinc-500/20 text-zinc-300",
  in_progress: "bg-blue-500/20 text-blue-400",
  review: "bg-amber-500/20 text-amber-400",
  done: "bg-emerald-500/20 text-emerald-400",
  blocked: "bg-red-500/20 text-red-400",
};

export default function TaskBoardPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function load() {
      const { data: projs } = await supabase
        .from("projects")
        .select("id, name")
        .eq("is_archived", false);

      setProjects(projs || []);

      const { data: t } = await supabase
        .from("tasks")
        .select("*")
        .order("npao_class")
        .order("sort_order");

      setTasks((t as Task[]) || []);
    }
    load();
  }, [supabase]);

  const filtered = projectFilter === "all"
    ? tasks
    : tasks.filter((t) => t.project_id === projectFilter);

  async function moveTask(taskId: string, newClass: NPAOClass) {
    await supabase.from("tasks").update({ npao_class: newClass }).eq("id", taskId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, npao_class: newClass } : t)));
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  const columnTasks = (cls: NPAOClass) => filtered.filter((t) => t.npao_class === cls);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Task Board</h1>
          <p className="text-zinc-400">Global NPAO Kanban — {filtered.length} tasks</p>
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* NPAO columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NPAO_COLUMNS.map((col) => {
          const colData = columnTasks(col.cls);
          return (
            <div
              key={col.cls}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col min-h-[400px]"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <span className={cn("text-sm font-bold", npaoColor(col.cls).split(" ")[1])}>
                    {col.cls}
                  </span>
                  <span className="text-sm text-zinc-400 ml-2">{col.label}</span>
                </div>
                <span className="text-xs text-zinc-600">{colData.length}</span>
              </div>

              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {colData.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{task.title}</div>
                          {project && (
                            <div className="text-xs text-zinc-600 mt-0.5">{project.name}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Status */}
                        <select
                          value={task.status}
                          onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 focus:outline-none"
                        >
                          {["backlog", "todo", "in_progress", "review", "done", "blocked"].map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>

                        {/* NPAO move */}
                        <select
                          value={task.npao_class}
                          onChange={(e) => moveTask(task.id, e.target.value as NPAOClass)}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-500 focus:outline-none"
                        >
                          {NPAO_COLUMNS.map((c) => (
                            <option key={c.cls} value={c.cls}>
                              {c.cls}
                            </option>
                          ))}
                        </select>

                        {task.estimated_minutes && (
                          <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimated_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colData.length === 0 && (
                  <div className="text-center py-12 text-zinc-600 text-sm">
                    <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p>No {col.label.toLowerCase()} tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
