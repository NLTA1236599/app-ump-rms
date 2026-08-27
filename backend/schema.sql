-- Jira-style tracker: users, workspaces (projects), issues
-- Run after creating DB user: psql -U ump_rms_user -d ump_rms_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'user',
  display_name VARCHAR(255),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Existing DBs created before email verification: keep current users loginable.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
-- New inserts (without an explicit flag) must complete OTP before login.
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;

-- Unit-scoped topic access (empty = see all departments). Managed by fe0-admin.
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_units TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS registration_otp_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash        VARCHAR(128) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_otp_pending_user
  ON registration_otp_codes (user_id, created_at DESC)
  WHERE used_at IS NULL;

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

-- Yearly registration sequence (Đợt 1/2026 and Đợt 2/2026 share the same counter).
CREATE TABLE IF NOT EXISTS project_year_sequences (
  year         INTEGER PRIMARY KEY,
  last_number  INTEGER NOT NULL DEFAULT 0 CHECK (last_number >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_research_projects_seq_year_number
  ON research_projects (
    ((data->>'registrationSequenceYear')::integer),
    ((data->>'registrationSequenceNumber')::integer)
  )
  WHERE (data->>'registrationSequenceYear') ~ '^[0-9]+$'
    AND (data->>'registrationSequenceNumber') ~ '^[0-9]+$';

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
  ('tong-quan',           ARRAY['admin', 'leader', 'specialist', 'user']),
  ('tien-do-thuc-hien',   ARRAY['admin', 'leader', 'specialist', 'user']),
  ('du-lieu-de-tai',      ARRAY['admin', 'leader', 'specialist', 'user']),
  ('nhap-moi-du-lieu',    ARRAY['admin', 'leader', 'specialist', 'user']),
  ('ke-khai-ho-so',       ARRAY['admin', 'leader', 'specialist', 'user']),
  ('loc-trung-de-tai',    ARRAY['admin', 'leader', 'specialist', 'user'])
ON CONFLICT (feature) DO NOTHING;

-- Replace legacy CRUD feature keys with the KHCN sidebar catalog.
DELETE FROM feature_permissions
WHERE feature NOT IN (
  'tong-quan',
  'tien-do-thuc-hien',
  'du-lieu-de-tai',
  'nhap-moi-du-lieu',
  'ke-khai-ho-so',
  'loc-trung-de-tai'
);

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

-- ── TKKT configurable milestone reminders ───────────────────────────────────
CREATE TABLE IF NOT EXISTS reminder_milestone_types (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(64)  NOT NULL UNIQUE,
  name_vi      VARCHAR(255) NOT NULL,
  description  TEXT,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_offsets (
  id                 SERIAL PRIMARY KEY,
  milestone_type_id  INT NOT NULL REFERENCES reminder_milestone_types(id) ON DELETE CASCADE,
  offset_days        INT NOT NULL,
  label              VARCHAR(100),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_reminder_offset UNIQUE (milestone_type_id, offset_days),
  CONSTRAINT chk_reminder_offset_nonneg CHECK (offset_days >= 0)
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  milestone_type_id  INT NOT NULL REFERENCES reminder_milestone_types(id),
  due_date           DATE NOT NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_milestone UNIQUE (project_id, milestone_type_id),
  CONSTRAINT chk_project_milestone_status CHECK (status IN ('PENDING', 'DONE', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_due_pending
  ON project_milestones (due_date)
  WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS reminder_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_milestone_id  UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  offset_days           INT NOT NULL,
  recipient_email       VARCHAR(255) NOT NULL,
  recipient_role        VARCHAR(20)  NOT NULL,
  status                VARCHAR(20)  NOT NULL,
  error_message         TEXT,
  retry_count           INT NOT NULL DEFAULT 0,
  sent_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_reminder_log_status CHECK (status IN ('SENT', 'FAILED', 'CLAIMED')),
  CONSTRAINT uq_reminder_sent UNIQUE (project_milestone_id, offset_days, recipient_email)
);

INSERT INTO reminder_milestone_types (code, name_vi, description) VALUES
  ('PROGRESS_REPORT_1',    'Báo cáo tiến độ lần 1',           'progressReportDate1'),
  ('PROGRESS_REPORT_2',    'Báo cáo tiến độ lần 2',           'progressReportDate2'),
  ('PROGRESS_REPORT_3',    'Báo cáo tiến độ lần 3',           'progressReportDate3'),
  ('PROGRESS_REPORT_4',    'Báo cáo tiến độ lần 4',           'progressReportDate4'),
  ('MIDTERM_REPORT',       'Báo cáo giám định / giữa kỳ',     'reviewReportingDate'),
  ('ACCEPTANCE',           'Nghiệm thu (họp NT)',             'acceptanceMeetingDate'),
  ('ACCEPTANCE_EXTENSION', 'Gia hạn nghiệm thu',              'extensionDate'),
  ('FINAL_ACCEPTANCE_DOC', 'Nộp hồ sơ nghiệm thu cuối cùng',  'acceptanceCompletionDate')
ON CONFLICT (code) DO NOTHING;

-- Offset policy:
--   30 ngày: tiến độ 1–4, giám định, nghiệm thu (họp + nộp HS)
--   90 ngày: gia hạn nghiệm thu
-- Soft-deactivate other offsets so existing DBs converge on migrate.
UPDATE reminder_offsets ro
SET is_active = FALSE
FROM reminder_milestone_types t
WHERE ro.milestone_type_id = t.id
  AND t.code IN (
    'PROGRESS_REPORT_1', 'PROGRESS_REPORT_2', 'PROGRESS_REPORT_3', 'PROGRESS_REPORT_4',
    'MIDTERM_REPORT', 'ACCEPTANCE', 'FINAL_ACCEPTANCE_DOC', 'ACCEPTANCE_EXTENSION'
  )
  AND NOT (
    (t.code = 'ACCEPTANCE_EXTENSION' AND ro.offset_days = 90)
    OR (
      t.code IN (
        'PROGRESS_REPORT_1', 'PROGRESS_REPORT_2', 'PROGRESS_REPORT_3', 'PROGRESS_REPORT_4',
        'MIDTERM_REPORT', 'ACCEPTANCE', 'FINAL_ACCEPTANCE_DOC'
      )
      AND ro.offset_days = 30
    )
  );

INSERT INTO reminder_offsets (milestone_type_id, offset_days, label, is_active)
SELECT t.id, 30, 'Trước 30 ngày', TRUE
FROM reminder_milestone_types t
WHERE t.code IN (
  'PROGRESS_REPORT_1', 'PROGRESS_REPORT_2', 'PROGRESS_REPORT_3', 'PROGRESS_REPORT_4',
  'MIDTERM_REPORT', 'ACCEPTANCE', 'FINAL_ACCEPTANCE_DOC'
)
ON CONFLICT (milestone_type_id, offset_days) DO UPDATE
SET is_active = TRUE,
    label = EXCLUDED.label;

INSERT INTO reminder_offsets (milestone_type_id, offset_days, label, is_active)
SELECT t.id, 90, 'Trước 90 ngày', TRUE
FROM reminder_milestone_types t
WHERE t.code = 'ACCEPTANCE_EXTENSION'
ON CONFLICT (milestone_type_id, offset_days) DO UPDATE
SET is_active = TRUE,
    label = EXCLUDED.label;
