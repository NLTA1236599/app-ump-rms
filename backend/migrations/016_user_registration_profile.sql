-- Idempotent patch: persist public registration profile fields
-- Safe to run on DBs that already applied schema.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_id VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_rank VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_unit VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_roles TEXT[] NOT NULL DEFAULT '{}';
