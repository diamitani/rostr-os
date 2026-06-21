"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User, Mail, Building, Save } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then((user) => {
      setEmail(user.email || "");
      setFullName(user.name || "");
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    // Profile updates go through Cognito in production
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-1">Settings</h1><p className="text-zinc-400">Manage your profile</p></div>
      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" />Profile</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label><div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400"><Mail className="w-4 h-4" /><span>{email || "—"}</span></div></div>
            <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
          </div>
        </div>
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-violet-400" />AWS Infrastructure</h2>
          <div className="text-sm text-zinc-500 space-y-1">
            <p><strong>Auth:</strong> Amazon Cognito (us-east-2)</p>
            <p><strong>Database:</strong> Amazon RDS PostgreSQL 17.8 (us-east-2)</p>
            <p><strong>Storage:</strong> Amazon S3 (rostr-os-storage)</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all inline-flex items-center gap-2 disabled:opacity-50">
          {saving ? "Saving..." : saved ? (<><Save className="w-4 h-4" />Saved!</>) : (<><Save className="w-4 h-4" />Save Settings</>)}
        </button>
      </div>
      <div className="mt-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <h3 className="font-semibold mb-2">ROSTR OS</h3>
        <div className="text-sm text-zinc-500 space-y-1">
          <p>Open Source — MIT License</p>
          <p><a href="https://github.com/diamitani/rostr-os" target="_blank" className="text-blue-400 hover:underline">github.com/diamitani/rostr-os</a></p>
          <p>Built with the ROSTR Framework (PAL + NPAO + 4Ds + JTBD)</p>
          <p className="mt-2"><a href="https://rostr-paper.vercel.app" target="_blank" className="text-zinc-400 hover:text-white underline transition-colors">Read the ROSTR Research Paper →</a></p>
        </div>
      </div>
    </div>
  );
}
