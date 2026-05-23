import { AuthTabSwitcher, type AuthTabId } from './AuthTabSwitcher.js';
import { AuthTabPanel } from './AuthTabPanel.js';
import { LoginFormPanel } from './LoginFormPanel.js';
import { RegisterForm } from './RegisterForm.js';
import type { LoginIssue, LoginSubmitPhase } from './loginFlowTypes.js';

type LoginAuthCardContentProps = {
  activeTab: AuthTabId;
  onTabChange: (tab: AuthTabId) => void;
  phase: LoginSubmitPhase;
  issue: LoginIssue | null;
  onLoginSubmit: (identifier: string, password: string) => void;
};

/**
 * Card interior: segmented tabs + login/register panels. Tab state is shared here with
 * the “switch to register” link (`login-component-analysis.md` §11.3–§11.4).
 */
export function LoginAuthCardContent({
  activeTab,
  onTabChange,
  phase,
  issue,
  onLoginSubmit,
}: LoginAuthCardContentProps) {
  return (
    <>
      <AuthTabSwitcher active={activeTab} onChange={onTabChange} />

      <AuthTabPanel
        id="panel-login"
        ariaLabelledBy="tab-login"
        hidden={activeTab !== 'login'}
      >
        <LoginFormPanel
          phase={phase}
          issue={issue}
          onSubmit={onLoginSubmit}
          onSwitchToRegister={() => onTabChange('register')}
        />
      </AuthTabPanel>

      <AuthTabPanel
        id="panel-register"
        ariaLabelledBy="tab-register"
        hidden={activeTab !== 'register'}
      >
        <RegisterForm onSwitchToLogin={() => onTabChange('login')} />
      </AuthTabPanel>
    </>
  );
}
