"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, phaseColor, formatRelativeDate, npaoColor } from "@/lib/utils";
import type { Project, FourDsPhase } from "@/types";
import { Plus, Search, FolderKanban } from "lucide-react";

const PHASES: FourDsPhase[] = ["PreD", "D1", "D2", "D3", "D4"];

export default function ProjectsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<FourDsPhase | "all">("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });
      setProjects(data || []);
    }
    load();
  }, [supabase]);

  const filtered = projects.filter((p) => {
    if (filter !== "all" && p.phase !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p className="text-zinc-400">Manage your 4Ds project pipeline</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === "all"
                ? "bg-zinc-700 border-zinc-600 text-white"
                : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
            )}
          >
            All
          </button>
          {PHASES.map((phase) => (
            <button
              key={phase}
              onClick={() => setFilter(phase)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                filter === phase ? phaseColor(phase) : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
              )}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>

      {/* Create modal (inline) */}
      {showCreate && (
        <CreateProjectForm
          supabase={supabase}
          onCreated={(p) => {
            setProjects([p, ...projects]);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-1">No projects yet</p>
          <p className="text-sm">Create your first project or use AI Intake to generate one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/projects/${p.id}`)}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 cursor-pointer transition-all hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium border shrink-0",
                    phaseColor(p.phase)
                  )}
                >
                  {p.phase}
                </span>
              </div>
              {p.description && (
                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{p.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className={npaoColor("N")}>N:{p.n_count}</span>
                <span className={npaoColor("A")}>A:{p.a_count}</span>
                <span className={npaoColor("P")}>P:{p.p_count}</span>
                <span className={npaoColor("O")}>O:{p.o_count}</span>
                <span className="ml-auto">{formatRelativeDate(p.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inline Create Form ──
function CreateProjectForm({
  supabase,
  onCreated,
  onCancel,
}: {
  supabase: ReturnType<typeof createClient>;
  onCreated: (p: Project) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<FourDsPhase>("PreD");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.user!.id,
        name: name.trim(),
        description: description.trim(),
        phase,
      })
      .select()
      .single();

    if (!error && data) {
      onCreated(data as Project);
    }
    setSaving(false);
  }

  return (
    <div className="mb-6 p-6 rounded-xl border border-blue-500/30 bg-blue-500/5">
      <h3 className="font-semibold mb-4">New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          autoFocus
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />
        <div className="flex gap-2">
          {PHASES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                phase === p ? phaseColor(p) : "border-zinc-700 text-zinc-400 hover:text-white"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
