const PLACEHOLDER_USERS = new Set([
  '',
  'your-email@gmail.com',
  'you@gmail.com',
]);

const PLACEHOLDER_PASSES = new Set([
  '',
  'your-app-password',
  'xxxx xxxx xxxx xxxx',
  'changeme',
]);

/** True when MAIL_* look like real SMTP credentials (not empty / placeholders). */
export function isSmtpConfigured(): boolean {
  const host = (process.env.MAIL_HOST ?? '').trim();
  const user = (process.env.MAIL_USER ?? '').trim().toLowerCase();
  const passRaw = (process.env.MAIL_PASS ?? '').trim();
  const pass = passRaw.replace(/\s+/g, '');

  if (!host || !user || !pass) return false;
  if (PLACEHOLDER_USERS.has(user)) return false;
  if (PLACEHOLDER_PASSES.has(pass.toLowerCase()) || PLACEHOLDER_PASSES.has(passRaw.toLowerCase())) {
    return false;
  }
  return true;
}
