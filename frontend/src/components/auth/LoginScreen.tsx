import { useState } from 'react';
import { LoginPageShell } from './LoginPageShell.js';
import { LoginBrandingHeader } from './LoginBrandingHeader.js';
import { LoginAuthCard } from './LoginAuthCard.js';
import { LoginAuthCardContent } from './LoginAuthCardContent.js';
import { type AuthTabId } from './AuthTabSwitcher.js';
import { useLoginFlow } from './useLoginFlow.js';

/** Composed login/register route UI — mirrors `login-component-analysis.md` §13 `<LoginPage>`. */
export function LoginScreen() {
  const [activeTab, setActiveTab] = useState<AuthTabId>('login');
  const { phase, issue, submit } = useLoginFlow();

  const isRegister = activeTab === 'register';

  return (
    <LoginPageShell contentMaxClassName={isRegister ? 'max-w-[min(90vw,660px)]' : 'max-w-[420px]'}>
      <LoginBrandingHeader variant={isRegister ? 'register' : 'login'} />

      <LoginAuthCard>
        <LoginAuthCardContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          phase={phase}
          issue={issue}
          onLoginSubmit={submit}
        />
      </LoginAuthCard>
    </LoginPageShell>
  );
}
