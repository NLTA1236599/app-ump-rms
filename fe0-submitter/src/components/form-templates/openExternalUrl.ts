/** WorkflowProcess-final-spec.md §10 / openExternalUrl pattern */

export function openExternalUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) w.opener = null;
}
