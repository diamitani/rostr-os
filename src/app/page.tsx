"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers, Zap, Brain, Globe } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "NPAO Priority Framework",
    desc: "Every task classified as Necessity, Anxiety, Priority, or Opportunity — so you always know what to do first.",
  },
  {
    icon: Zap,
    title: "4Ds Lifecycle",
    desc: "PreD → Design → Develop → Deploy → Deliver. Every project moves through a proven phase gate system.",
  },
  {
    icon: Brain,
    title: "PAL AI Intake",
    desc: "Describe your project in plain English. PAL compiles it into a structured build plan with tasks, estimates, and priorities.",
  },
  {
    icon: Globe,
    title: "Cross-Org Ready",
    desc: "Manage personal tasks, business projects, and team workflows across organizations — all in one dashboard.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold">
              R
            </div>
            <span className="font-semibold text-lg">ROSTR OS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-300 mb-8">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Open Source — MIT License
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          The AI-Native{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Project OS
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          An open-source Asana alternative powered by the ROSTR framework.
          NPAO task prioritization, 4Ds project lifecycle, and PAL AI intake —
          built for individuals and teams who want structure without the bloat.
        </p>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all inline-flex items-center gap-2"
          >
            Start building free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://github.com/pdiamitani/rostr-os"
            target="_blank"
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-all"
          >
            View on GitHub
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Built on ROSTR</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            The same framework that powers Atlas HXM&apos;s GTM automation —
            now available as an open-source project management platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
              >
                <f.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NPAO Visual */}
      <section className="border-t border-zinc-800 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">NPAO: Always know what&apos;s next</h2>
          <p className="text-zinc-400 mb-12">
            Every task gets a priority class. The execution order is non-negotiable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { cls: "N", label: "Necessity", sub: "I MUST — hard blockers", color: "bg-red-500/10 border-red-500/20 text-red-400" },
              { cls: "A", label: "Anxiety", sub: "I WON'T HAVE PEACE", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
              { cls: "P", label: "Priority", sub: "I NEED — core work", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
              { cls: "O", label: "Opportunity", sub: "I CAN — optional", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
            ].map((item) => (
              <div key={item.cls} className={`p-5 rounded-xl border ${item.color} text-left`}>
                <div className="text-2xl font-bold mb-1">{item.cls}</div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs mt-1 opacity-60">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <span>N</span><span className="text-zinc-600">→</span>
            <span>A</span><span className="text-zinc-600">→</span>
            <span>P</span><span className="text-zinc-600">→</span>
            <span>O</span>
            <span className="ml-2 text-zinc-600">Execution order is strict</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center text-sm text-zinc-500">
        <p>ROSTR OS — Open Source (MIT) · Built with the ROSTR Framework · <Link href="https://rostr-paper.vercel.app" className="underline hover:text-zinc-300" target="_blank">Read the paper</Link></p>
      </footer>
    </div>
  );
}
