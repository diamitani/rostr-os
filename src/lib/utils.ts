import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

export function npaoOrder(a: string, b: string): number {
  const order: Record<string, number> = { N: 0, A: 1, P: 2, O: 3 };
  return (order[a] ?? 99) - (order[b] ?? 99);
}

export function phaseOrder(a: string, b: string): number {
  const order: Record<string, number> = { PreD: 0, D1: 1, D2: 2, D3: 3, D4: 4 };
  return (order[a] ?? 99) - (order[b] ?? 99);
}

export function npaoColor(cls: string): string {
  const colors: Record<string, string> = {
    N: "bg-red-500/10 text-red-400 border-red-500/20",
    A: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    P: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    O: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return colors[cls] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

export function phaseColor(phase: string): string {
  const colors: Record<string, string> = {
    PreD: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    D1: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    D2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    D3: "bg-red-500/10 text-red-400 border-red-500/20",
    D4: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return colors[phase] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
