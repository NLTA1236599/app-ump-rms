import { formatDate } from '../../utils/formatDate.js';

/** View-mode date display — empty values show "---". */
export function formatDisplayDate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '---';
  const formatted = formatDate(value);
  return formatted || '---';
}
