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
