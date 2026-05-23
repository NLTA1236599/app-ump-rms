import { useCallback, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext.js';
import { loginIdentifierToUsername } from './loginIdentifier.js';
import { validateInstitutionalEmail } from './institutionalEmail.js';
import type { LoginIssue, LoginSubmitPhase } from './loginFlowTypes.js';

export function useLoginFlow() {
  const { login } = useAuthContext();
  const [phase, setPhase] = useState<LoginSubmitPhase>('idle');
  const [issue, setIssue] = useState<LoginIssue | null>(null);

  const submit = useCallback(
    async (emailInput: string, password: string) => {
      setIssue(null);

      const validated = validateInstitutionalEmail(emailInput);
      if (!validated.ok) {
        setIssue({ kind: 'generic', message: validated.message });
        return;
      }

      setPhase('submitting');
      const username = loginIdentifierToUsername(validated.normalized);
      const result = await login(username, password);
      setPhase('idle');

      if (result.ok) return;

      if (result.code === 'email_unverified') {
        setIssue({ kind: 'email_unverified', message: result.message });
        return;
      }
      setIssue({ kind: 'generic', message: result.message });
    },
    [login]
  );

  return { phase, issue, submit };
}
