import { useId, useState } from 'react';
import { LoginFieldLabel } from '../features/auth/LoginFieldLabel.js';
import { LoginTextInput } from '../features/auth/LoginTextInput.js';
import { LoginSubmitButton } from '../features/auth/LoginSubmitButton.js';
import { LoginFormAlert } from '../features/auth/LoginFormAlert.js';
import type { LoginIssue, LoginSubmitPhase } from './loginFlowTypes.js';
import { LoginEmailUnverifiedNotice } from './LoginEmailUnverifiedNotice.js';
import { LoginEmailFieldHelper } from './LoginEmailFieldHelper.js';
import { LoginForgotPasswordLink } from './LoginForgotPasswordLink.js';
import { LoginSessionRoleBlock } from './LoginSessionRoleBlock.js';
import { LOGIN_REQUIRES_ROLE_CHOICE } from './loginSessionRoleOptions.js';

type LoginCredentialsFormProps = {
  phase: LoginSubmitPhase;
  issue: LoginIssue | null;
  onSubmit: (identifier: string, password: string) => void;
};

/** Login form fields — includes session role picker when multi‑role UX is enabled (UMP login UI spec). */
export function LoginCredentialsForm({ phase, issue, onSubmit }: LoginCredentialsFormProps) {
  const helperId = useId();
  const roleSelectId = useId();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [sessionRole, setSessionRole] = useState('');

  const busy = phase === 'submitting';
  const roleGateOk = !LOGIN_REQUIRES_ROLE_CHOICE || sessionRole !== '';
  const submitDisabled = busy || !roleGateOk;

  return (
    <form
      className="flex w-full flex-col outline-none"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(identifier, password);
      }}
      noValidate
    >
      <div className="mb-4">
        <LoginFieldLabel htmlFor="login-email">Email</LoginFieldLabel>
        <LoginTextInput
          id="login-email"
          type="email"
          autoComplete="username"
          placeholder="nltanh@ump.edu.vn"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          aria-describedby={helperId}
          required
        />
        <LoginEmailFieldHelper id={helperId} />
      </div>

      <div className="mb-1">
        <div className="mb-1.5 flex w-full items-end justify-between gap-3">
          <LoginFieldLabel htmlFor="login-password" className="mb-0">
            Mật khẩu
          </LoginFieldLabel>
          <LoginForgotPasswordLink />
        </div>
        <LoginTextInput
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <LoginSessionRoleBlock id={roleSelectId} value={sessionRole} onChange={setSessionRole} />

      <div className="mb-5 mt-4">
        {issue?.kind === 'email_unverified' ? (
          <LoginEmailUnverifiedNotice message={issue.message} />
        ) : issue?.kind === 'generic' ? (
          <LoginFormAlert message={issue.message} />
        ) : null}
      </div>

      <LoginSubmitButton disabled={submitDisabled} sentenceCase>
        {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </LoginSubmitButton>
    </form>
  );
}
