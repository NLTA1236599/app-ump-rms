/**
 * UX-only validation; server is authoritative.
 * Allowed: `{local}@ump.edu.vn` or `{local}@umc.edu.vn`.
 */
const DOMAINS = new Set(['@ump.edu.vn', '@umc.edu.vn']);

export function normalizeInstitutionalEmailInput(input: string): string {
  return input.trim().toLowerCase();
}

export type InstitutionalEmailResult =
  | { ok: true; normalized: string }
  | { ok: false; message: string };

export function validateInstitutionalEmail(input: string): InstitutionalEmailResult {
  const normalized = normalizeInstitutionalEmailInput(input);
  if (!normalized) {
    return { ok: false, message: 'Vui lòng nhập email.' };
  }

  const at = normalized.indexOf('@');
  if (at <= 0 || at === normalized.length - 1) {
    return {
      ok: false,
      message: 'Email không hợp lệ. Dùng địa chỉ @ump.edu.vn hoặc @umc.edu.vn.',
    };
  }

  const domain = normalized.slice(at);
  if (!DOMAINS.has(domain)) {
    return {
      ok: false,
      message: 'Chỉ chấp nhận email @ump.edu.vn hoặc @umc.edu.vn.',
    };
  }

  const local = normalized.slice(0, at).trim();
  if (!local) {
    return { ok: false, message: 'Email không hợp lệ.' };
  }

  return { ok: true, normalized: `${local}${domain}` };
}
