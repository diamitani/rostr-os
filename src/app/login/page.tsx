"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-zinc-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xl font-bold mb-6">R</div>
          <h1 className="text-4xl font-bold mb-4">Welcome back to ROSTR OS</h1>
          <p className="text-zinc-400 leading-relaxed">The AI-native project OS. NPAO task prioritization, 4Ds lifecycle, and PAL-powered project intake — all open source.</p>
          <div className="mt-8 space-y-3">
            {[
              { cls: "N", label: "Necessity — I MUST", color: "text-red-400" },
              { cls: "A", label: "Anxiety — I WON'T HAVE PEACE", color: "text-amber-400" },
              { cls: "P", label: "Priority — I NEED", color: "text-blue-400" },
              { cls: "O", label: "Opportunity — I CAN", color: "text-emerald-400" },
            ].map((i) => (
              <div key={i.cls} className="flex items-center gap-3 text-sm">
                <span className={`font-bold ${i.color} w-6`}>{i.cls}</span>
                <span className="text-zinc-500">{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Sign in</h2>
          <p className="text-zinc-400 text-sm mb-8">Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:underline">Sign up</Link></p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="you@company.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="••••••••" required />
              </div>
            </div>
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign in
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
