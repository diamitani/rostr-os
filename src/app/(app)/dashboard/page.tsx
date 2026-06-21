"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn, npaoColor, phaseColor } from "@/lib/utils";
import type { Project, Task, NPAOClass, FourDsPhase } from "@/types";
import { BarChart3, CheckCircle2, Clock, Layers, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [projs, t] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
      ]);
      setProjects(projs || []);
      setTasks(t || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    npao: { N: 0, A: 0, P: 0, O: 0 } as Record<NPAOClass, number>,
    phases: {} as Record<FourDsPhase, number>,
  };
  tasks.forEach((t) => {
    stats.npao[t.npao_class]++;
    stats.phases[t.phase] = (stats.phases[t.phase] || 0) + 1;
  });

  const npaoData = [
    { cls: "N" as NPAOClass, label: "Necessity", count: stats.npao.N, color: "bg-red-500" },
    { cls: "A" as NPAOClass, label: "Anxiety", count: stats.npao.A, color: "bg-amber-500" },
    { cls: "P" as NPAOClass, label: "Priority", count: stats.npao.P, color: "bg-blue-500" },
    { cls: "O" as NPAOClass, label: "Opportunity", count: stats.npao.O, color: "bg-emerald-500" },
  ];
  const maxNpao = Math.max(...npaoData.map((d) => d.count), 1);

  const statCards = [
    { label: "Projects", value: stats.totalProjects, icon: Layers, color: "text-blue-400" },
    { label: "Total Tasks", value: stats.totalTasks, icon: BarChart3, color: "text-violet-400" },
    { label: "Done", value: stats.completedTasks, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-400" },
  ];

  const phaseRows = [
    { phase: "PreD" as FourDsPhase, label: "Drafting", desc: "Research & validate" },
    { phase: "D1" as FourDsPhase, label: "Design", desc: "Lock decisions" },
    { phase: "D2" as FourDsPhase, label: "Develop", desc: "Build & test" },
    { phase: "D3" as FourDsPhase, label: "Deploy", desc: "Release" },
    { phase: "D4" as FourDsPhase, label: "Deliver", desc: "Monitor & optimize" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-1">Dashboard</h1><p className="text-zinc-400">ROSTR-powered project overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} />{s.label}</div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" />NPAO Task Distribution</h2>
          <div className="space-y-4">
            {npaoData.map((d) => (
              <div key={d.cls}>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-zinc-300">{d.cls} — {d.label}</span><span className="text-zinc-500">{d.count}</span></div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${(d.count / maxNpao) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><span>Execution order:</span><span className="text-red-400 font-bold">N</span><span>→</span><span className="text-amber-400 font-bold">A</span><span>→</span><span className="text-blue-400 font-bold">P</span><span>→</span><span className="text-emerald-400 font-bold">O</span></div>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4">4Ds — Project Phases</h2>
          <div className="space-y-3">
            {phaseRows.map((p) => {
              const count = stats.phases[p.phase] || 0;
              const projectCount = projects.filter((pr) => pr.phase === p.phase).length;
              return (
                <div key={p.phase} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", phaseColor(p.phase))}>{p.phase}</span>
                    <div><div className="text-sm font-medium">{p.label}</div><div className="text-xs text-zinc-500">{p.desc}</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-medium">{projectCount} projects</div><div className="text-xs text-zinc-500">{count} tasks</div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <h2 className="font-semibold mb-4">Active Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-zinc-500"><Layers className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No projects yet. Create one or use AI Intake.</p></div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div><div className="font-medium">{p.name}</div><div className="text-xs text-zinc-500 mt-0.5">N:{p.n_count} A:{p.a_count} P:{p.p_count} O:{p.o_count}</div></div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", phaseColor(p.phase))}>{p.phase}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
