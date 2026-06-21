"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Building, Save } from "lucide-react";
import type { UserProfile } from "@/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (p) {
        setProfile(p as UserProfile);
        setFullName(p.full_name || "");
      } else {
        // Create profile
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: user.user.id,
            email: user.user.email!,
            full_name: user.user.user_metadata?.full_name || "",
          })
          .select()
          .single();

        if (newProfile) {
          setProfile(newProfile as UserProfile);
          setFullName(newProfile.full_name || "");
        }
      }
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", profile.id);

    if (orgName.trim()) {
      // Check if org exists
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", orgName.trim())
        .single();

      let orgId = existingOrg?.id;
      if (!orgId) {
        const slug = orgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const { data: newOrg } = await supabase
          .from("organizations")
          .insert({ name: orgName.trim(), slug })
          .select()
          .single();
        orgId = newOrg?.id;
      }

      if (orgId) {
        await supabase
          .from("profiles")
          .update({ organization_id: orgId })
          .eq("id", profile.id);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-zinc-400">Manage your profile and organization</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400">
                <Mail className="w-4 h-4" />
                <span>{profile?.email || "—"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500 ml-3 -mr-1" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Patrick Diamitani"
                  className="w-full pl-2 pr-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-violet-400" />
            Organization
          </h2>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Atlas HXM"
              className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Create or join an organization to share projects and tasks with your team.
            </p>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            "Saving..."
          ) : saved ? (
            <>
              <Save className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <h3 className="font-semibold mb-2">ROSTR OS</h3>
        <div className="text-sm text-zinc-500 space-y-1">
          <p>Open Source — MIT License</p>
          <p>
            <a
              href="https://github.com/pdiamitani/rostr-os"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              github.com/pdiamitani/rostr-os
            </a>
          </p>
          <p>Built with the ROSTR Framework (PAL + NPAO + 4Ds + JTBD)</p>
          <p className="mt-2">
            <a
              href="https://rostr-paper.vercel.app"
              target="_blank"
              className="text-zinc-400 hover:text-white underline transition-colors"
            >
              Read the ROSTR Research Paper →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
