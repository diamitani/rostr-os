import { Pool } from "pg";

const HOST = "rostr-os-db.cxemci6qw4f1.us-east-2.rds.amazonaws.com";
const USER = "rostr_admin";
const PASS = String.fromCharCode(82,111,115,116,114,79,83,50,48,50,54,33,83,101,99,117,114,101);

async function main() {
  const pool = new Pool({
    host: HOST, port: 5432, database: "rostr_os",
    user: USER, password: PASS,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query("DROP TABLE IF EXISTS tasks CASCADE");
    await pool.query("DROP TABLE IF EXISTS projects CASCADE");
    await pool.query("DROP TABLE IF EXISTS profiles CASCADE");
    await pool.query("DROP TABLE IF EXISTS organizations CASCADE");
    await pool.query("DROP FUNCTION IF EXISTS update_updated_at CASCADE");
    await pool.query("DROP FUNCTION IF EXISTS update_project_npao_counts CASCADE");
    console.log("✓ Cleaned");

    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await pool.query(`CREATE TABLE organizations (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`);
    await pool.query(`CREATE TABLE profiles (id UUID PRIMARY KEY, email TEXT NOT NULL, full_name TEXT, avatar_url TEXT, organization_id UUID REFERENCES organizations(id), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
    await pool.query(`CREATE TABLE projects (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL, organization_id UUID REFERENCES organizations(id), name TEXT NOT NULL, description TEXT DEFAULT '', phase TEXT NOT NULL DEFAULT 'PreD' CHECK (phase IN ('PreD','D1','D2','D3','D4')), due_date TIMESTAMPTZ, is_archived BOOLEAN DEFAULT false, n_count INTEGER DEFAULT 0, a_count INTEGER DEFAULT 0, p_count INTEGER DEFAULT 0, o_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
    await pool.query(`CREATE TABLE tasks (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', npao_class TEXT NOT NULL DEFAULT 'P' CHECK (npao_class IN ('N','A','P','O')), phase TEXT NOT NULL DEFAULT 'D1' CHECK (phase IN ('PreD','D1','D2','D3','D4')), status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog','todo','in_progress','review','done','blocked')), assignee TEXT, due_date TIMESTAMPTZ, estimated_minutes INTEGER, actual_minutes INTEGER, build_prompt TEXT, done_when TEXT, parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
    console.log("✓ Tables");

    for (const idx of [
      "CREATE INDEX idx_projects_user ON projects(user_id)",
      "CREATE INDEX idx_projects_phase ON projects(phase)",
      "CREATE INDEX idx_tasks_project ON tasks(project_id)",
      "CREATE INDEX idx_tasks_user ON tasks(user_id)",
      "CREATE INDEX idx_tasks_npao ON tasks(npao_class)",
      "CREATE INDEX idx_tasks_status ON tasks(status)",
    ]) { await pool.query(idx); }
    console.log("✓ Indexes");

    await pool.query(`CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $_$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $_$ LANGUAGE plpgsql`);
    await pool.query("CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at()");
    await pool.query("CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at()");
    await pool.query("CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at()");
    console.log("✓ Triggers");

    const { rows } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log("✓ Done:", rows.map((r: any) => r.table_name).join(", "));
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
