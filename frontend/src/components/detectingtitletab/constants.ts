import type { BreadcrumbItem } from '../DataTable/types.js';

export const LOC_TRUNG_BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Đề tài KHCN', href: '/de-tai-khcn' },
  { label: 'Lọc Trùng Đề Tài' },
];

/** Minimum word-overlap (overlap coefficient) for "Khớp tương đối". */
export const FUZZY_OVERLAP_THRESHOLD = 0.75;
