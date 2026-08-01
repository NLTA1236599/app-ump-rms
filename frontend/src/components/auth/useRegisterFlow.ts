import { useCallback, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext.js';
import type { OtpDeliveryChannel } from './registration/constants.js';
import { DEFAULT_OTP_TTL_SECONDS } from './registration/constants.js';

export type RegisterSubmitPhase = 'idle' | 'submitting';

export type RegisterBanner =
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string };

export type RegisterSuccessPayload = {
  email: string;
  otpTtlSeconds: number;
  otpDeliveryChannel: OtpDeliveryChannel;
};

export function useRegisterFlow(onRegistered?: (payload: RegisterSuccessPayload) => void) {
  const { register } = useAuthContext();
  const [phase, setPhase] = useState<RegisterSubmitPhase>('idle');
  const [banner, setBanner] = useState<RegisterBanner | null>(null);

  const submit = useCallback(
    async (input: { email: string; password: string; displayName: string }) => {
      setBanner(null);
      setPhase('submitting');
      const result = await register(input.email, input.password, input.displayName.trim());
      setPhase('idle');

      if (result.ok) {
        if (result.emailVerificationRequired) {
          onRegistered?.({
            email: result.email,
            otpTtlSeconds: result.otpTtlSeconds || DEFAULT_OTP_TTL_SECONDS,
            otpDeliveryChannel: result.otpDeliveryChannel,
          });
          return;
        }
        setBanner({
          kind: 'success',
          message: 'Đăng ký thành công. Bạn có thể đăng nhập.',
        });
        return;
      }
      setBanner({ kind: 'error', message: result.message });
    },
    [register, onRegistered]
  );

  const clearBanner = useCallback(() => setBanner(null), []);

  return { phase, banner, submit, clearBanner };
}
