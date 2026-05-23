import type { AnnouncementItem } from './types.js';

/** Demo dataset — canonical copy from ProgressTracking-final-spec.md §3.3 */
export const DEMO_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'a1',
    tag: 'THÔNG BÁO',
    tone: 'notice',
    title: 'Gia hạn nộp thuyết minh đề tài cấp Trường đợt 2',
    at: new Date(2024, 4, 20),
  },
  {
    id: 'a2',
    tag: 'SỰ KIỆN',
    tone: 'event',
    title: 'Hội thảo khoa học quốc tế: Chuyển đổi số trong giáo dục',
    at: new Date(2024, 5, 15),
  },
  {
    id: 'a3',
    tag: 'HƯỚNG DẪN',
    tone: 'guide',
    title: 'Hướng dẫn thanh quyết toán kinh phí nghiên cứu',
    at: new Date(2024, 4, 12),
  },
];
