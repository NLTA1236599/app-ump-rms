-- Idempotent patch: topic-type access for users (fe0-admin "Phân quyền theo đơn vị")

ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_project_types TEXT[] NOT NULL DEFAULT '{}';
