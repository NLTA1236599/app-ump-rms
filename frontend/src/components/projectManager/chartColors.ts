/** Palette stacked bar — cùng họ xanh UMP, đủ tương phản để phân biệt. */

export const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {
  'Chưa phân loại': { color: '#94a3b8', label: 'Chưa phân loại' },
  chua_phan_loai: { color: '#94a3b8', label: 'Chưa phân loại' },
  'Loại A': { color: '#1a6ec2', label: 'Loại A' },
  loai_a: { color: '#1a6ec2', label: 'Loại A' },
  'Loại B': { color: '#0891b2', label: 'Loại B' },
  loai_b: { color: '#0891b2', label: 'Loại B' },
  'Loại C': { color: '#7c3aed', label: 'Loại C' },
  loai_c: { color: '#7c3aed', label: 'Loại C' },
  'Loại D': { color: '#4f46e5', label: 'Loại D' },
  loai_d: { color: '#4f46e5', label: 'Loại D' },
  'Sinh viên': { color: '#059669', label: 'Sinh viên' },
  sinh_vien: { color: '#059669', label: 'Sinh viên' },
  'Tự túc kinh phí': { color: '#d97706', label: 'Tự túc kinh phí' },
  phi: { color: '#d97706', label: 'Tự túc kinh phí' },
  Khác: { color: '#64748b', label: 'Khác' },
  'Đăng ký mới': { color: '#3b82f6', label: 'Đăng ký mới' },
  'Đang thực hiện': { color: '#d97706', label: 'Đang thực hiện' },
  'Đã nghiệm thu': { color: '#059669', label: 'Đã nghiệm thu' },
  'Nghiệm thu': { color: '#059669', label: 'Nghiệm thu' },
  'Trễ hạn': { color: '#dc2626', label: 'Trễ hạn' },
  'Gia hạn': { color: '#7c3aed', label: 'Gia hạn' },
  'Thanh lý': { color: '#0891b2', label: 'Thanh lý' },
};

export const FALLBACK_COLORS = [
  '#1a6ec2',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#64748b',
  '#be185d',
];

export function getCategoryColor(key: string, index: number): string {
  return CATEGORY_COLORS[key]?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#1a6ec2';
}

export function getCategoryLabel(key: string): string {
  return CATEGORY_COLORS[key]?.label ?? key;
}
