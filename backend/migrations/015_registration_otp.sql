-- Idempotent patch: email OTP verification for registration
-- Safe to run on DBs that already applied schema.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;

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
