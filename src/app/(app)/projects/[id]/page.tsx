"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { cn, phaseColor, npaoColor } from "@/lib/utils";
import type { Project, Task, NPAOClass, TaskStatus } from "@/types";
import { ArrowLeft, Plus, Clock, Trash2, Pencil } from "lucide-react";

const NPAO_COLUMNS: { cls: NPAOClass; label: string; color: string }[] = [
  { cls: "N", label: "Necessity", color: "border-red-500/30" },
  { cls: "A", label: "Anxiety", color: "border-amber-500/30" },
  { cls: "P", label: "Priority", color: "border-blue-500/30" },
  { cls: "O", label: "Opportunity", color: "border-emerald-500/30" },
];
const STATUS_OPTIONS: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done", "blocked"];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState<NPAOClass | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  useEffect(() => {
    api.getProject(id).then(setProject);
    api.getTasks(id).then(setTasks);
  }, [id]);

  async function addTask(cls: NPAOClass, title: string) {
    const t = await api.createTask({ project_id: id, title, npao_class: cls, phase: project?.phase || "D1" });
    setTasks([...tasks, t]);
    setShowAdd(null);
  }

  async function updateTask(taskId: string, updates: Record<string, any>) {
    const t = await api.updateTask(taskId, updates);
    setTasks(tasks.map((tk) => (tk.id === taskId ? t : tk)));
  }

  async function deleteTask(taskId: string) {
    await api.deleteTask(taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  if (!project) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/projects")} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{project.name}</h1>{project.description && <p className="text-zinc-400 text-sm mt-1">{project.description}</p>}</div>
        <span className={cn("px-3 py-1 rounded-lg text-sm font-medium border", phaseColor(project.phase))}>{project.phase}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NPAO_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.npao_class === col.cls);
          return (
            <div key={col.cls} className={`rounded-xl border ${col.color} bg-zinc-900/30 flex flex-col min-h-[300px]`}>
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div><div className="font-semibold text-sm">{col.cls} — {col.label}</div><div className="text-xs text-zinc-500">{colTasks.length} tasks</div></div>
                <button onClick={() => setShowAdd(col.cls)} className="p-1 rounded hover:bg-zinc-800 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {colTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors group">
                    {editingTask === task.id ? (
                      <EditInline task={task} onSave={(updates) => { updateTask(task.id, updates); setEditingTask(null); }} onCancel={() => setEditingTask(null)} />
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1"><div className="text-sm font-medium">{task.title}</div>{task.description && <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</div>}</div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => setEditingTask(task.id)} className="p-1 rounded hover:bg-zinc-700"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <select value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value })} className="text-xs px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 focus:outline-none">
                            {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
                          </select>
                          {task.estimated_minutes && <span className="text-xs text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimated_minutes}m</span>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {colTasks.length === 0 && showAdd !== col.cls && <div className="text-center py-8 text-zinc-600 text-sm"><p>No {col.label.toLowerCase()} tasks</p></div>}
              </div>
              {showAdd === col.cls && (
                <div className="p-3 border-t border-zinc-800">
                  <AddForm onAdd={(title) => addTask(col.cls, title)} onCancel={() => setShowAdd(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddForm({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) onAdd(title.trim()); }} className="space-y-2">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" autoFocus />
      <div className="flex gap-2">
        <button type="submit" disabled={!title.trim()} className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">Add</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors">Cancel</button>
      </div>
    </form>
  );
}

function EditInline({ task, onSave, onCancel }: { task: Task; onSave: (u: Record<string, any>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimated_minutes?.toString() || "");
  const [doneWhen, setDoneWhen] = useState(task.done_when || "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ title: title.trim(), description, estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null, done_when: doneWhen.trim() || null }); }} className="space-y-2">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50" autoFocus />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-2 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none resize-none" />
      <div className="flex gap-2">
        <input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} placeholder="Est. min" className="w-20 px-2 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-white text-xs focus:outline-none" />
        <input type="text" value={doneWhen} onChange={(e) => setDoneWhen(e.target.value)} placeholder="Done when..." className="flex-1 px-2 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200">Save</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800">Cancel</button>
      </div>
    </form>
  );
}
