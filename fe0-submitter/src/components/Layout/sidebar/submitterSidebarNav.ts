/** Sidebar menu for submitter portal — structure mirrors port 5173 `deTaiKhcnSidebarNav.ts`. */
export type SubmitterSidebarItemId =
  | 'de-tai-cua-toi'
  | 'dang-ky-moi'
  | 'tien-do'
  | 'thong-bao';

export type SubmitterSidebarItem = {
  id: SubmitterSidebarItemId;
  label: string;
  route: string;
};

export const SUBMITTER_SIDEBAR_ITEMS: SubmitterSidebarItem[] = [
  { id: 'de-tai-cua-toi', label: 'Đề tài của tôi', route: '/de-tai' },
  { id: 'dang-ky-moi', label: 'Đăng ký mới', route: '/de-tai/dang-ky' },
  { id: 'tien-do', label: 'Tiến độ các đề tài', route: '/de-tai/tien-do' },
  { id: 'thong-bao', label: 'Các biểu mẫu', route: '/thong-bao' },
];

export function resolveSidebarItemFromPath(pathname: string): SubmitterSidebarItemId | null {
  if (pathname.startsWith('/de-tai/dang-ky')) return 'dang-ky-moi';
  if (pathname.startsWith('/de-tai/tien-do')) return 'tien-do';
  if (pathname.startsWith('/thong-bao')) return 'thong-bao';
  if (pathname.startsWith('/de-tai')) return 'de-tai-cua-toi';
  return null;
}

export function resolveRouteForSidebarItem(id: SubmitterSidebarItemId): string {
  return SUBMITTER_SIDEBAR_ITEMS.find((item) => item.id === id)?.route ?? '/de-tai';
}
