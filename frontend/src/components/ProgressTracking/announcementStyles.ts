import type { AnnouncementTone } from './types.js';

/** Spec §3.3 + extended states §3 tag logic */
export function badgeClassesForTone(tone: AnnouncementTone): string {
  switch (tone) {
    case 'overdue':
      return 'bg-red-100 text-red-700';
    case 'pre_acceptance':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}
