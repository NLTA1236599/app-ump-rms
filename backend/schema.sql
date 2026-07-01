-- Jira-style tracker: users, workspaces (projects), issues
-- Run after creating DB user: psql -U ump_rms_user -d ump_rms_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'user',
  display_name VARCHAR(255),
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_prefix  VARCHAR(32)  NOT NULL UNIQUE,
  name        TEXT         NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  issue_number  INTEGER NOT NULL,
  summary       TEXT NOT NULL,
  description   TEXT DEFAULT '',
  issue_type    VARCHAR(32) NOT NULL DEFAULT 'task',
  priority      VARCHAR(32) NOT NULL DEFAULT 'medium',
  status        VARCHAR(32) NOT NULL DEFAULT 'todo',
  assignee_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_issues_workspace_status ON issues (workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_issues_workspace_position ON issues (workspace_id, status, position);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON workspaces;
CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

-- Uploaded Excel files — metadata in DB, binary on disk (bind-mounted uploads/)
CREATE TABLE IF NOT EXISTS project_import_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name TEXT        NOT NULL,
  filename      TEXT        NOT NULL,
  file_path     TEXT        NOT NULL,
  row_count     INTEGER     NOT NULL DEFAULT 0,
  uploaded_by   UUID        NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_import_files_uploaded_by ON project_import_files (uploaded_by);

-- Research project data (Excel import + manual entry) — persists across sessions
CREATE TABLE IF NOT EXISTS research_projects (
  id             UUID PRIMARY KEY,
  data           JSONB       NOT NULL,
  import_file_id UUID        REFERENCES project_import_files(id) ON DELETE SET NULL,
  created_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
  updated_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_projects_created_at ON research_projects (created_at DESC);

DROP TRIGGER IF EXISTS trg_research_projects_updated_at ON research_projects;
CREATE TRIGGER trg_research_projects_updated_at
  BEFORE UPDATE ON research_projects
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

-- Feature-level access permissions (managed by fe0-admin)
CREATE TABLE IF NOT EXISTS feature_permissions (
  feature       TEXT        PRIMARY KEY,
  allowed_roles TEXT[]      NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO feature_permissions (feature, allowed_roles) VALUES
  ('project.create',        ARRAY['admin', 'leader']),
  ('project.view',          ARRAY['admin', 'leader', 'specialist', 'user']),
  ('project.edit',          ARRAY['admin', 'leader']),
  ('project.delete',        ARRAY['admin']),
  ('project.upload',        ARRAY['admin', 'leader']),
  ('report.view',           ARRAY['admin', 'leader', 'specialist']),
  ('report.export',         ARRAY['admin']),
  ('admin.users',           ARRAY['admin']),
  ('admin.permissions',     ARRAY['admin'])
ON CONFLICT (feature) DO NOTHING;

-- Email reminder: parse ISO date strings from research_projects JSONB
CREATE OR REPLACE FUNCTION jsonb_text_to_date(value TEXT)
RETURNS DATE AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;
  IF value ~ '^\d{4}-\d{2}-\d{2}' THEN
    RETURN substring(value from 1 for 10)::date;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Email reminder: parse ISO date/time strings from research_projects JSONB
CREATE OR REPLACE FUNCTION jsonb_text_to_timestamptz(value TEXT)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN value::timestamptz;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;

  IF value ~ '^\d{4}-\d{2}-\d{2}' THEN
    RETURN (substring(value from 1 for 10) || ' 00:00:00')::timestamptz;
  END IF;

  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Specialists linked to research projects (email reminder recipients)
CREATE TABLE IF NOT EXISTS project_specialists (
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_specialists_user ON project_specialists (user_id);

-- Log sent reminders to avoid duplicate emails on re-runs the same day
CREATE TABLE IF NOT EXISTS reminder_send_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  job_type     TEXT NOT NULL,
  recipient    TEXT NOT NULL,
  sent_on      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, job_type, recipient, sent_on)
);
