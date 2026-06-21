# ROSTR OS — AI-Native Project OS

**Open-source Asana alternative powered by the ROSTR framework.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-✅-3ECF8E)](https://supabase.com/)

ROSTR OS is an open-source project management platform built on the [ROSTR Framework](https://rostr-paper.vercel.app) — **PAL** (Prompt Abstraction Layer), **NPAO** (Necessity/Anxiety/Priority/Opportunity), **4Ds** (Design/Develop/Deploy/Deliver), and **JTBD** (Jobs to be Done).

## Why ROSTR OS?

Most project tools are either too simple (lists) or too complex (Jira). ROSTR OS gives you **structured prioritization without the bloat**:

- **NPAO Task Classification** — Every task tagged N/A/P/O with a strict execution order
- **4Ds Project Lifecycle** — PreD → D1 → D2 → D3 → D4 phase gates
- **PAL AI Intake** — Describe your project in plain English, get a full build plan
- **Cross-Org Ready** — Manage personal tasks, business projects, and team workflows
- **Open Source (MIT)** — Self-host or deploy to Vercel in one click

## Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **State:** Zustand
- **Icons:** Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com/) account (free tier works)

### Setup

```bash
# Clone
git clone https://github.com/pdiamitani/rostr-os.git
cd rostr-os

# Install
npm install

# Copy env
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase URL and anon key from your Supabase project dashboard.

### Database

Run the schema in your Supabase SQL editor:

```bash
# Copy from supabase/schema.sql and paste into Supabase SQL Editor
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pdiamitani/rostr-os)

Set these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ROSTR Framework

ROSTR OS is the reference implementation of the ROSTR framework:

| Module | What It Does |
|---|---|
| **PAL** | AI-powered project intake — compiles plain English into structured plans |
| **NPAO** | Task prioritization — Necessity → Anxiety → Priority → Opportunity |
| **4Ds** | Lifecycle phases — PreD, D1 Design, D2 Develop, D3 Deploy, D4 Deliver |
| **JTBD** | Jobs to be Done — atomic task breakdown with build prompts |

[Read the ROSTR research paper →](https://rostr-paper.vercel.app)

## License

MIT — see [LICENSE](LICENSE)

## Author

Built by [Patrick Diamitani](https://github.com/pdiamitani) — GTM AI & Automation Manager at Atlas HXM.
