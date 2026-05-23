/** Sidebar menu for tab "Đề tài KHCN" — spec: `BHXH-sidebar-analysis.md` §6 */
export type DeTaiKhcnSidebarItemId =
  | 'tong-quan'
  | 'tien-do-thuc-hien'
  | 'du-lieu-de-tai'
  | 'nhap-moi-du-lieu'
  | 'ke-khai-ho-so';

export type DeTaiKhcnSidebarItem = {
  id: DeTaiKhcnSidebarItemId;
  label: string;
};

export const DE_TAI_KHCN_SIDEBAR_ITEMS: DeTaiKhcnSidebarItem[] = [
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'tien-do-thuc-hien', label: 'Tiến độ thực hiện' },
  { id: 'du-lieu-de-tai', label: 'Dữ liệu đề tài' },
  { id: 'nhap-moi-du-lieu', label: 'Nhập mới dữ liệu' },
  { id: 'ke-khai-ho-so', label: 'Kê khai hồ sơ' },
];

export const DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM: DeTaiKhcnSidebarItemId = 'tong-quan';
