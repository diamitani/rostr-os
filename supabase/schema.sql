-- ════════════════════════════════════════
-- ROSTR OS — Supabase Schema
-- Framework: ROSTR (PAL + NPAO + 4Ds + JTBD)
-- ════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Organizations ──
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Profiles ──
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects ──
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  phase TEXT NOT NULL DEFAULT 'PreD' CHECK (phase IN ('PreD', 'D1', 'D2', 'D3', 'D4')),
  due_date TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  n_count INTEGER DEFAULT 0,
  a_count INTEGER DEFAULT 0,
  p_count INTEGER DEFAULT 0,
  o_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tasks ──
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  npao_class TEXT NOT NULL DEFAULT 'P' CHECK (npao_class IN ('N', 'A', 'P', 'O')),
  phase TEXT NOT NULL DEFAULT 'D1' CHECK (phase IN ('PreD', 'D1', 'D2', 'D3', 'D4')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done', 'blocked')),
  assignee TEXT,
  due_date TIMESTAMPTZ,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  build_prompt TEXT,
  done_when TEXT,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_phase ON projects(phase);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_npao ON tasks(npao_class);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_phase ON tasks(phase);

-- ── Updated_at trigger ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── NPAO counter trigger (auto-update project counts) ──
CREATE OR REPLACE FUNCTION update_project_npao_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET
      n_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'N'),
      a_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'A'),
      p_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'P'),
      o_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'O')
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET
      n_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'N'),
      a_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'A'),
      p_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'P'),
      o_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'O')
    WHERE id = OLD.project_id;
  ELSIF TG_OP = 'UPDATE' AND (OLD.npao_class <> NEW.npao_class OR OLD.project_id <> NEW.project_id) THEN
    UPDATE projects SET
      n_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'N'),
      a_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'A'),
      p_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'P'),
      o_count = (SELECT COUNT(*) FROM tasks WHERE project_id = NEW.project_id AND npao_class = 'O')
    WHERE id = NEW.project_id;
    IF OLD.project_id <> NEW.project_id THEN
      UPDATE projects SET
        n_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'N'),
        a_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'A'),
        p_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'P'),
        o_count = (SELECT COUNT(*) FROM tasks WHERE project_id = OLD.project_id AND npao_class = 'O')
      WHERE id = OLD.project_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_npao_counts
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_npao_counts();

-- ── RLS Policies ──
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read their org
CREATE POLICY org_read ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE organization_id = organizations.id AND id = auth.uid())
    OR (SELECT raw_user_meta_data->>'organization_id' FROM auth.users WHERE id = auth.uid()) = organizations.id::text
  );

-- Profiles: users can read their own + org members
CREATE POLICY profiles_read ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY profiles_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Projects: owner + org members can read
CREATE POLICY projects_read ON projects
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Tasks: owner + org members can read
CREATE POLICY tasks_read ON tasks
  FOR SELECT USING (
    user_id = auth.uid()
    OR project_id IN (SELECT id FROM projects WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (user_id = auth.uid());
