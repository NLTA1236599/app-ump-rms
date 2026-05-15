import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext.js';
import { LoginBackground } from './LoginBackground.js';
import { LoginBlueWave } from './LoginBlueWave.js';
import { LoginBrandingPanel } from './LoginBrandingPanel.js';
import { LoginPageFooter } from './LoginPageFooter.js';
import { LoginCardHeader } from './LoginCardHeader.js';
import { LoginFieldLabel } from './LoginFieldLabel.js';
import { LoginTextInput } from './LoginTextInput.js';
import { LoginRoleSelect } from './LoginRoleSelect.js';
import { LOGIN_ROLE_OPTIONS, type LoginRoleValue } from './loginRoleOptions.js';
import { LoginSubmitButton } from './LoginSubmitButton.js';
import { LoginRegisterPrompt } from './LoginRegisterPrompt.js';
import { LoginFormAlert } from './LoginFormAlert.js';
import { loginIdentifierToUsername } from './loginUtils.js';

export default function Login() {
  const { login } = useAuthContext();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<LoginRoleValue>('project_lead');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const username = loginIdentifierToUsername(identifier);
    const result = await login(username, password);
    setBusy(false);
    if (!result.ok) setError(result.message);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden font-sans text-ump-navy">
      <LoginBackground />
      <LoginBlueWave />
      <LoginBrandingPanel />

      {/* Card nudged left on large screens so it sits in the “middle third” like the mockup */}
      <div
        className={`
          fixed left-1/2 top-1/2 z-10 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2
          max-lg:max-w-[90vw]
          lg:-translate-x-[calc(50%+min(72px,6.5vw))]
        `}
      >
        <div className="min-h-[560px] rounded-[24px] border-[1.5px] border-ump-border-card bg-white px-6 py-8 shadow-[0_12px_48px_rgba(30,95,175,0.16)] md:min-h-[590px] md:px-10 md:pb-9 md:pt-12">
          <LoginCardHeader />

          <form className="flex w-full flex-col" onSubmit={onSubmit} noValidate>
            <div className="mb-5">
              <LoginFieldLabel htmlFor="login-email">Email</LoginFieldLabel>
              <LoginTextInput
                id="login-email"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="admin@ump.edu.vn"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <LoginFieldLabel htmlFor="login-password">Mật khẩu</LoginFieldLabel>
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

            <div className="mb-6">
              <LoginFieldLabel htmlFor="login-role">Phân quyền</LoginFieldLabel>
              <LoginRoleSelect id="login-role" value={role} onRoleChange={setRole} aria-label="Phân quyền">
                {LOGIN_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </LoginRoleSelect>
            </div>

            {error ? <LoginFormAlert message={error} /> : null}

            <LoginSubmitButton disabled={busy}>
              {busy ? 'Đang đăng nhập…' : 'ĐĂNG NHẬP'}
            </LoginSubmitButton>
          </form>

          <LoginRegisterPrompt />
        </div>
      </div>

      <LoginPageFooter />
    </div>
  );
}
