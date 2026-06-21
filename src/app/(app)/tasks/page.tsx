"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn, npaoColor } from "@/lib/utils";
import type { Task, NPAOClass, TaskStatus } from "@/types";
import { CheckSquare, Clock } from "lucide-react";

const NPAO_COLUMNS: { cls: NPAOClass; label: string }[] = [
  { cls: "N", label: "Necessity" }, { cls: "A", label: "Anxiety" },
  { cls: "P", label: "Priority" }, { cls: "O", label: "Opportunity" },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectFilter, setProjectFilter] = useState("all");

  useEffect(() => {
    api.getProjects().then(setProjects);
    api.getTasks().then(setTasks);
  }, []);

  const filtered = projectFilter === "all" ? tasks : tasks.filter((t) => t.project_id === projectFilter);

  async function moveTask(taskId: string, newClass: NPAOClass) {
    const t = await api.updateTask(taskId, { npao_class: newClass });
    setTasks(tasks.map((tk) => (tk.id === taskId ? t : tk)));
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    const t = await api.updateTask(taskId, { status });
    setTasks(tasks.map((tk) => (tk.id === taskId ? t : tk)));
  }

  const columnTasks = (cls: NPAOClass) => filtered.filter((t) => t.npao_class === cls);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold mb-1">Task Board</h1><p className="text-zinc-400">Global NPAO Kanban — {filtered.length} tasks</p></div>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none">
          <option value="all">All Projects</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NPAO_COLUMNS.map((col) => {
          const colData = columnTasks(col.cls);
          return (
            <div key={col.cls} className="rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col min-h-[400px]">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div><span className={cn("text-sm font-bold", npaoColor(col.cls).split(" ")[1])}>{col.cls}</span><span className="text-sm text-zinc-400 ml-2">{col.label}</span></div>
                <span className="text-xs text-zinc-600">{colData.length}</span>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {colData.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  return (
                    <div key={task.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{task.title}</div>{project && <div className="text-xs text-zinc-600 mt-0.5">{project.name}</div>}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)} className="text-xs px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 focus:outline-none">
                          {["backlog", "todo", "in_progress", "review", "done", "blocked"].map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
                        </select>
                        <select value={task.npao_class} onChange={(e) => moveTask(task.id, e.target.value as NPAOClass)} className="text-xs px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-500 focus:outline-none">
                          {NPAO_COLUMNS.map((c) => (<option key={c.cls} value={c.cls}>{c.cls}</option>))}
                        </select>
                        {task.estimated_minutes && <span className="text-xs text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimated_minutes}m</span>}
                      </div>
                    </div>
                  );
                })}
                {colData.length === 0 && <div className="text-center py-12 text-zinc-600 text-sm"><CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-50" /><p>No {col.label.toLowerCase()} tasks</p></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
