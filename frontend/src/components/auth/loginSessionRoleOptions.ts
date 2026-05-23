/** Session role cards for login UI (API still uses server JWT role; this is UX for multi‑role accounts). */
export type LoginSessionRoleOption = {
  value: string;
  label: string;
  subtitle: string;
  icon: string;
};

export const LOGIN_SESSION_ROLE_OPTIONS: LoginSessionRoleOption[] = [
  {
    value: 'specialist',
    label: 'Chuyên viên',
    subtitle: 'Hỗ trợ thẩm định / xử lý hồ sơ đề tài',
    icon: '🔬',
  },
  {
    value: 'user',
    label: 'Người nộp đề tài',
    subtitle: 'Chủ nhiệm đề tài / Thư ký khoa học',
    icon: '👁',
  },
  {
    value: 'leader',
    label: 'Lãnh đạo',
    subtitle: 'Phê duyệt & điều phối cấp đơn vị',
    icon: '👔',
  },
  {
    value: 'admin',
    label: 'Quản trị viên',
    subtitle: 'Cấu hình hệ thống & người dùng',
    icon: '⚙️',
  },
];

export const LOGIN_REQUIRES_ROLE_CHOICE = LOGIN_SESSION_ROLE_OPTIONS.length >= 2;
