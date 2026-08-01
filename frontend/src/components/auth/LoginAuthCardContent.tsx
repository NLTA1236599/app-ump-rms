import { AuthTabSwitcher, type AuthTabId } from './AuthTabSwitcher.js';
import { AuthTabPanel } from './AuthTabPanel.js';
import { LoginFormPanel } from './LoginFormPanel.js';
import {
  RegistrationWithOtp,
  type ResumeOtpRequest,
} from './registration/RegistrationWithOtp.js';
import type { LoginIssue, LoginSubmitPhase } from './loginFlowTypes.js';

type LoginAuthCardContentProps = {
  activeTab: AuthTabId;
  onTabChange: (tab: AuthTabId) => void;
  phase: LoginSubmitPhase;
  issue: LoginIssue | null;
  onLoginSubmit: (identifier: string, password: string, sessionRole?: string) => void;
  resumeOtp: ResumeOtpRequest | null;
  onResumeOtp: (email: string) => void;
  onResumeConsumed: () => void;
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
  resumeOtp,
  onResumeOtp,
  onResumeConsumed,
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
          onResumeOtp={onResumeOtp}
        />
      </AuthTabPanel>

      <AuthTabPanel
        id="panel-register"
        ariaLabelledBy="tab-register"
        hidden={activeTab !== 'register'}
      >
        <RegistrationWithOtp
          onSwitchToLogin={() => onTabChange('login')}
          resumeOtp={resumeOtp}
          onResumeConsumed={onResumeConsumed}
        />
      </AuthTabPanel>
    </>
  );
}
