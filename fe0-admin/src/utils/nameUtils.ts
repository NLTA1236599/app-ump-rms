/**
 * Tạo chữ viết tắt từ tên tiếng Việt.
 * "Trần Ngọc Đăng" → "TĐ"
 * "Hoàng Thị Cẩm Chương" → "HC"
 * "Lãnh đạo" → "LĐ"
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0]?.charAt(0) ?? '?').toUpperCase();
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts[parts.length - 1]?.charAt(0) ?? '';
  return (first + last).toUpperCase();
}

const TITLE_DISPLAY_NAMES = new Set(['lanh dao', 'quan tri vien', 'admin']);

function normalizePersonName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Nhãn ngắn dưới avatar: tên (từ cuối) với người thật,
 * giữ nguyên chức danh như "Lãnh đạo".
 */
export function getShortDisplayName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return trimmed;
  if (TITLE_DISPLAY_NAMES.has(normalizePersonName(trimmed))) return trimmed;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}

export function getLastName(fullName: string): string {
  return getShortDisplayName(fullName);
}

/** Palettes đủ dài để mỗi cột trên bảng phân quyền có màu riêng. */
const AVATAR_COLORS = [
  '#1a6ec2',
  '#dc2626',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#4f46e5',
  '#ca8a04',
  '#0f766e',
  '#ea580c',
  '#9333ea',
  '#2563eb',
  '#16a34a',
  '#be123c',
  '#0e7490',
  '#b45309',
  '#6d28d9',
  '#047857',
  '#c026d3',
  '#1d4ed8',
  '#b91c1c',
  '#65a30d',
  '#0369a1',
];

/** Màu ổn định theo tên (fallback khi không có chỉ số cột). */
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!;
}

/** Mỗi cột một màu khác nhau; không phụ thuộc hash nên không bị trùng xanh/tím hàng loạt. */
export function getAvatarColorByIndex(index: number): string {
  if (index < AVATAR_COLORS.length) {
    return AVATAR_COLORS[index] ?? AVATAR_COLORS[0]!;
  }
  const hue = Math.round((index * 137.508) % 360);
  return `hsl(${hue} 68% 40%)`;
}
