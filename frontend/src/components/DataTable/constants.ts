import type { BreadcrumbItem } from './types.js';

export const BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Đề tài KHCN', href: '/de-tai-khcn' },
  { label: 'Dữ liệu đề tài' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200] as const;

export const DEFAULT_PAGE_SIZE = 50;
