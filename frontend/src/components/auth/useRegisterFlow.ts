import { useCallback, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext.js';
import type { RegisterProfile } from '../../services/interfaces/IAuthService.js';

export type RegisterSubmitPhase = 'idle' | 'submitting';

export type RegisterBanner =
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string };

export type RegisterSuccessPayload = {
  email: string;
};

export function useRegisterFlow(onRegistered?: (payload: RegisterSuccessPayload) => void) {
  const { register } = useAuthContext();
  const [phase, setPhase] = useState<RegisterSubmitPhase>('idle');
  const [banner, setBanner] = useState<RegisterBanner | null>(null);

  const submit = useCallback(
    async (input: { email: string; password: string; displayName: string } & RegisterProfile) => {
      setBanner(null);
      setPhase('submitting');
      const result = await register(input.email, input.password, input.displayName.trim(), {
        staffId: input.staffId,
        phone: input.phone,
        academicRank: input.academicRank,
        workUnit: input.workUnit,
        jobTitle: input.jobTitle,
        requestedRoles: input.requestedRoles,
      });
      setPhase('idle');

      if (result.ok) {
        onRegistered?.({ email: result.email });
        return;
      }
      setBanner({ kind: 'error', message: result.message });
    },
    [register, onRegistered]
  );

  const clearBanner = useCallback(() => setBanner(null), []);

  return { phase, banner, submit, clearBanner };
}
