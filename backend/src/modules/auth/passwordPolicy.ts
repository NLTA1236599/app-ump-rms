/** Single source of truth for registration/password-change rules (T09). Login of existing accounts is unaffected. */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRequirementId =
  | 'minLength'
  | 'maxLength'
  | 'lower'
  | 'upper'
  | 'digit'
  | 'special'
  | 'notEmailLocal';

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  ok: boolean;
};

function emailLocalPart(email: string): string {
  const at = email.trim().toLowerCase().indexOf('@');
  if (at <= 0) return '';
  return email.trim().toLowerCase().slice(0, at);
}

export function passwordRequirements(password: string, email = ''): PasswordRequirement[] {
  const local = emailLocalPart(email);
  return [
    {
      id: 'minLength',
      label: `Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`,
      ok: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'maxLength',
      label: `Tối đa ${PASSWORD_MAX_LENGTH} ký tự`,
      ok: password.length <= PASSWORD_MAX_LENGTH,
    },
    { id: 'lower', label: 'Có ít nhất 1 chữ thường', ok: /[a-z]/.test(password) },
    { id: 'upper', label: 'Có ít nhất 1 chữ hoa', ok: /[A-Z]/.test(password) },
    { id: 'digit', label: 'Có ít nhất 1 chữ số', ok: /\d/.test(password) },
    { id: 'special', label: 'Có ít nhất 1 ký tự đặc biệt', ok: /[^A-Za-z0-9]/.test(password) },
    {
      id: 'notEmailLocal',
      label: 'Không chứa phần tên email',
      ok: !local || !password.toLowerCase().includes(local),
    },
  ];
}

export function validatePassword(
  password: string,
  email = ''
): { ok: true } | { ok: false; message: string } {
  const failed = passwordRequirements(password, email).filter((r) => !r.ok);
  if (failed.length === 0) return { ok: true };
  return { ok: false, message: failed[0]?.label ?? 'Mật khẩu chưa đủ mạnh.' };
}
