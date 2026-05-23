import { useCallback, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext.js';
import { loginIdentifierToUsername } from './loginIdentifier.js';

export type RegisterSubmitPhase = 'idle' | 'submitting';

export type RegisterBanner =
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string };

export function useRegisterFlow() {
  const { register } = useAuthContext();
  const [phase, setPhase] = useState<RegisterSubmitPhase>('idle');
  const [banner, setBanner] = useState<RegisterBanner | null>(null);

  const submit = useCallback(
    async (input: { email: string; password: string; displayName: string; apiRole: string }) => {
      setBanner(null);
      setPhase('submitting');
      const username = loginIdentifierToUsername(input.email);
      const result = await register(username, input.password, input.apiRole, input.displayName.trim());
      setPhase('idle');

      if (result.ok) {
        setBanner({
          kind: 'success',
          message:
            'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận trước khi đăng nhập (nếu hệ thống đã bật xác minh).',
        });
        return;
      }
      setBanner({ kind: 'error', message: result.message });
    },
    [register]
  );

  const clearBanner = useCallback(() => setBanner(null), []);

  return { phase, banner, submit, clearBanner };
}
