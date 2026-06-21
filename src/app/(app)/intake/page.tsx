"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, npaoColor, phaseColor } from "@/lib/utils";
import type { NPAOClass, FourDsPhase } from "@/types";
import { Sparkles, Loader2, CheckCircle2, ArrowRight, Brain, Target, Zap } from "lucide-react";

// ── PAL Intake Engine (client-side simulation) ──
// In production, this calls an AI endpoint. For the MVP, it uses
// structured templates based on the ROSTR framework.
function simulatePALIntake(rawDescription: string): {
  projectName: string;
  description: string;
  phase: FourDsPhase;
  tasks: { title: string; description: string; npao_class: NPAOClass; phase: FourDsPhase; estimated_minutes: number; done_when: string; build_prompt: string }[];
} {
  const lower = rawDescription.toLowerCase();

  // Simple intent detection
  const isAutomation = /automate|workflow|integration|pipeline|n8n|zapier/.test(lower);
  const isDashboard = /dashboard|report|analytics|metrics|kpi|chart/.test(lower);
  const isContent = /content|blog|social|email campaign|newsletter/.test(lower);
  const isSales = /sales|prospect|outreach|lead|crm|pipeline/.test(lower);
  const isInternal = /internal|tool|admin|config|setup|onboard/.test(lower);

  let projectType = "General Project";
  if (isAutomation) projectType = "Automation";
  else if (isDashboard) projectType = "Dashboard / Reporting";
  else if (isContent) projectType = "Content / Marketing";
  else if (isSales) projectType = "Sales / Prospecting";
  else if (isInternal) projectType = "Internal Tool";

  const projectName = rawDescription.slice(0, 60).replace(/\n/g, " ").trim() + (rawDescription.length > 60 ? "..." : "");

  // Generate NPAO tasks based on project type
  const tasks: { title: string; description: string; npao_class: NPAOClass; phase: FourDsPhase; estimated_minutes: number; done_when: string; build_prompt: string }[] = [];

  // N-class tasks (always needed)
  tasks.push({
    title: "Define input schema and data sources",
    description: "Identify all inputs, their formats, and where they come from",
    npao_class: "N",
    phase: "PreD",
    estimated_minutes: 30,
    done_when: "All input sources documented with format specifications",
    build_prompt: `Map every data input for ${projectName}. List: source system, data format, fields needed, access method, and who owns it.`,
  });

  tasks.push({
    title: "Confirm tool access and API credentials",
    description: "Verify all required tools are accessible with proper credentials",
    npao_class: "N",
    phase: "PreD",
    estimated_minutes: 45,
    done_when: "All required API keys confirmed and tested",
    build_prompt: `For ${projectName}: list every tool/API needed. For each: confirm access, test the connection, document the credential location.`,
  });

  // A-class tasks (anxiety resolution)
  if (isAutomation || isInternal) {
    tasks.push({
      title: "Define edge cases and error handling",
      description: "Document what happens when inputs are missing, malformed, or unexpected",
      npao_class: "A",
      phase: "D1",
      estimated_minutes: 30,
      done_when: "Edge case matrix documented with fallback behavior for each scenario",
      build_prompt: `For ${projectName}: create an edge case matrix. For each input field: what if it's missing, malformed, duplicated, or from an unexpected source? Document the fallback.`,
    });
  }

  tasks.push({
    title: "Resolve scope boundaries",
    description: "Clarify what is in-scope vs out-of-scope to prevent creep",
    npao_class: "A",
    phase: "D1",
    estimated_minutes: 20,
    done_when: "Scope document with explicit in/out boundaries",
    build_prompt: `For ${projectName}: write a scope boundary doc. IN scope (what WILL be built), OUT of scope (explicitly excluded), and MAYBE (defer to v2).`,
  });

  // P-class tasks (core build)
  if (isAutomation) {
    tasks.push({
      title: "Build automation workflow",
      description: "Create the core automation pipeline",
      npao_class: "P",
      phase: "D2",
      estimated_minutes: 120,
      done_when: "End-to-end workflow executes successfully with test data",
      build_prompt: `Build the ${projectName} automation. Step 1: create the trigger. Step 2: add data processing nodes. Step 3: add output/action nodes. Step 4: test with real data.`,
    });
  } else if (isDashboard) {
    tasks.push({
      title: "Build dashboard layout and data connections",
      description: "Create the dashboard structure with live data connections",
      npao_class: "P",
      phase: "D2",
      estimated_minutes: 90,
      done_when: "Dashboard renders with live data from all sources",
      build_prompt: `Build the ${projectName} dashboard. Step 1: design the layout wireframe. Step 2: connect data sources. Step 3: create visualizations. Step 4: add filters and date ranges.`,
    });
  } else {
    tasks.push({
      title: `Build the ${projectType.toLowerCase()} core`,
      description: `Implement the primary deliverable for ${projectName}`,
      npao_class: "P",
      phase: "D2",
      estimated_minutes: 90,
      done_when: "Core functionality working end-to-end",
      build_prompt: `Build the core of ${projectName}. Start with the minimum viable version, test it, then iterate.`,
    });
  }

  tasks.push({
    title: "Write tests and validate outputs",
    description: "Test all scenarios and verify output quality",
    npao_class: "P",
    phase: "D2",
    estimated_minutes: 45,
    done_when: "All test cases pass with expected outputs",
    build_prompt: `For ${projectName}: create a test plan. Test with: happy path, edge cases, missing data, high volume. Document results.`,
  });

  // O-class tasks
  tasks.push({
    title: "Add monitoring and alerts",
    description: "Set up monitoring for the deployed project",
    npao_class: "O",
    phase: "D4",
    estimated_minutes: 30,
    done_when: "Alerts configured for failures and anomalies",
    build_prompt: `For ${projectName}: set up monitoring. What to track, what thresholds trigger alerts, where alerts go (Slack, email, dashboard).`,
  });

  tasks.push({
    title: "Create documentation and runbook",
    description: "Document how the project works for future maintainers",
    npao_class: "O",
    phase: "D4",
    estimated_minutes: 30,
    done_when: "Documentation covers setup, operation, and troubleshooting",
    build_prompt: `Write documentation for ${projectName}: what it does, how it works, how to set it up, how to troubleshoot common issues.`,
  });

  return {
    projectName,
    description: `${projectType} — generated by PAL from: "${rawDescription.slice(0, 100)}"`,
    phase: "PreD",
    tasks,
  };
}

export default function IntakePage() {
  const router = useRouter();
  const supabase = createClient();
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof simulatePALIntake> | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleIntake() {
    if (!input.trim()) return;
    setProcessing(true);

    // Simulate PAL processing delay
    await new Promise((r) => setTimeout(r, 1500));
    const intakeResult = simulatePALIntake(input);
    setResult(intakeResult);
    setProcessing(false);
  }

  async function handleSaveAndBuild() {
    if (!result) return;
    setProcessing(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Create project
    const { data: project } = await supabase
      .from("projects")
      .insert({
        user_id: user.user.id,
        name: result.projectName,
        description: result.description,
        phase: result.phase,
      })
      .select()
      .single();

    if (project) {
      // Create all tasks
      const taskInserts = result.tasks.map((t, i) => ({
        project_id: project.id,
        user_id: user.user.id,
        title: t.title,
        description: t.description,
        npao_class: t.npao_class,
        phase: t.phase,
        estimated_minutes: t.estimated_minutes,
        done_when: t.done_when,
        build_prompt: t.build_prompt,
        sort_order: i,
      }));

      await supabase.from("tasks").insert(taskInserts);
      setSaved(true);

      setTimeout(() => {
        router.push(`/projects/${project.id}`);
      }, 1500);
    }

    setProcessing(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-blue-400" />
          AI Intake
        </h1>
        <p className="text-zinc-400">
          PAL (Prompt Abstraction Layer) — describe your project in plain English.
          ROSTR compiles it into a structured build plan with NPAO-classified tasks.
        </p>
      </div>

      {/* PAL Pipeline Visual */}
      <div className="mb-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          {["L1: Intent", "L2: Composition", "L3: Optimization", "L4: Compilation", "L5: Runtime"].map(
            (stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-zinc-800 text-xs">{stage}</span>
                {i < 4 && <span>→</span>}
              </div>
            )
          )}
        </div>
      </div>

      {/* Input */}
      {!result && (
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Describe your project in plain English...

Examples:
"Build a HubSpot automation that enriches new contacts with company data and routes them to the right rep"
"Create a weekly pipeline dashboard showing deal progression by stage and rep"
"Set up an n8n workflow that posts deal updates to Slack when a deal moves stages"`}
            rows={6}
            className="w-full px-4 py-4 rounded-xl border border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-lg"
          />

          <div className="flex gap-3">
            <button
              onClick={handleIntake}
              disabled={!input.trim() || processing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {processing ? "Compiling with PAL..." : "Compile with PAL"}
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {processing && !result && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-zinc-400">PAL is compiling your project...</p>
          <p className="text-sm text-zinc-600 mt-1">L1: Extracting intent → L2: Composing behaviors → L3: Optimizing → L4: Compiling</p>
        </div>
      )}

      {/* Result */}
      {result && !saved && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">PAL Compilation Complete</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{result.projectName}</h2>
            <p className="text-zinc-400 text-sm mb-4">{result.description}</p>

            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", phaseColor(result.phase))}>
                {result.phase}
              </span>
              <span className="text-sm text-zinc-500">{result.tasks.length} tasks generated</span>
            </div>
          </div>

          {/* NPAO Task Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Generated Tasks (NPAO Classified)
            </h3>
            {result.tasks.map((task, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50"
              >
                <div className="flex items-start gap-3">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold border shrink-0 mt-0.5", npaoColor(task.npao_class))}>
                    {task.npao_class}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{task.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                      <span>{task.estimated_minutes} min</span>
                      <span>{task.phase}</span>
                      <span className="text-zinc-500 truncate max-w-[300px]">Done when: {task.done_when}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveAndBuild}
              disabled={processing}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              Save & Start Building
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setInput("");
              }}
              className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-all"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Saved confirmation */}
      {saved && (
        <div className="text-center py-16 animate-fade-in">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
          <h2 className="text-2xl font-bold mb-2">Project Created!</h2>
          <p className="text-zinc-400 mb-4">
            All {result?.tasks.length} tasks saved with NPAO classification.
          </p>
          <p className="text-sm text-zinc-500">Redirecting to your project board...</p>
        </div>
      )}
    </div>
  );
}
