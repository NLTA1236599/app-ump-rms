import { LoginFormSectionHeader } from './LoginFormSectionHeader.js';
import { LoginCredentialsForm } from './LoginCredentialsForm.js';
import { LoginRegisterFooterPrompt } from './LoginRegisterFooterPrompt.js';
import type { LoginIssue, LoginSubmitPhase } from './loginFlowTypes.js';

type LoginFormPanelProps = {
  phase: LoginSubmitPhase;
  issue: LoginIssue | null;
  onSubmit: (identifier: string, password: string, sessionRole?: string) => void;
  onSwitchToRegister: () => void;
};

/**
 * Login tab body — bundles section header, credentials form, and in-card footer
 * (`login-component-analysis.md` §13 `<LoginForm>`).
 */
export function LoginFormPanel({ phase, issue, onSubmit, onSwitchToRegister }: LoginFormPanelProps) {
  return (
    <>
      <LoginFormSectionHeader />
      <LoginCredentialsForm phase={phase} issue={issue} onSubmit={onSubmit} />
      <LoginRegisterFooterPrompt onSwitchToRegister={onSwitchToRegister} />
    </>
  );
}
