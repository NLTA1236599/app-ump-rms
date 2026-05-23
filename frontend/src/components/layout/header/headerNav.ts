/** Primary navigation tab ids — spec: `Rechange Header.md` §3.2 */
export type HeaderNavTabId =
  | 'de-tai-khcn'
  | 'sang-kien'
  | 'ho-so-y-duc'
  | 'bai-bao-quoc-te'
  | 'gio-nckh'
  | 'hoi-nghi-hoi-thao'
  | 'thong-ke-so-lieu'
  | 'chuyen-giao-cong-nghe';

export type HeaderNavTab = {
  id: HeaderNavTabId;
  label: string;
};

export const HEADER_NAV_TABS: HeaderNavTab[] = [
  { id: 'de-tai-khcn', label: 'Đề tài KHCN' },
  { id: 'sang-kien', label: 'Sáng kiến' },
  { id: 'ho-so-y-duc', label: 'Hồ sơ Y đức' },
  { id: 'bai-bao-quoc-te', label: 'Bài báo quốc tế' },
  { id: 'gio-nckh', label: 'Giờ NCKH' },
  { id: 'hoi-nghi-hoi-thao', label: 'Hội nghị - Hội thảo' },
  { id: 'thong-ke-so-lieu', label: 'Thống kê số liệu' },
  { id: 'chuyen-giao-cong-nghe', label: 'Chuyển giao công nghệ' },
];

export const DEFAULT_HEADER_NAV_TAB: HeaderNavTabId = 'de-tai-khcn';
