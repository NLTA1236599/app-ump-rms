import type { AnnouncementItem } from './types.js';

export const DEMO_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'a1',
    tag: 'SẮP NGHIỆM THU',
    tone: 'pre_acceptance',
    title: 'Tổng hợp xanh nano bạc từ dịch chiết lá ổi — hạn kết thúc 30/09/2026',
    at: new Date(2026, 8, 30),
  },
  {
    id: 'a2',
    tag: 'SẮP NGHIỆM THU',
    tone: 'pre_acceptance',
    title: 'Ứng dụng AI trong nghiên cứu khoa học và — hạn kết thúc 15/12/2026',
    at: new Date(2026, 11, 15),
  },
  {
    id: 'a3',
    tag: 'THÔNG BÁO',
    tone: 'notice',
    title: 'Gia hạn nộp thuyết minh đề tài cấp Trường đợt 2',
    at: new Date(2024, 4, 20),
  },
];
