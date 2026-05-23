/**
 * Login UI phases mirror the submit lifecycle (idle → submitting).
 * Distinct from account/server state; see `assets/docs/otp-registration-state-machine.md`.
 */
export type LoginSubmitPhase = 'idle' | 'submitting';

/**
 * Login-scoped UX issues. `email_unverified` maps to HTTP 403 after password check
 * when the account exists but inbox verification is incomplete.
 */
export type LoginIssue =
  | { kind: 'generic'; message: string }
  | { kind: 'email_unverified'; message: string };
