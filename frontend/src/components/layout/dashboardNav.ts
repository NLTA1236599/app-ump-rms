export type DashboardNavId =
  | 'overview'
  | 'project-mgmt'
  | 'implementation-progress'
  | 'research-data'
  | 'new-data'
  | 'process';

export type DashboardNavItem = {
  id: DashboardNavId;
  label: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'project-mgmt', label: 'Quản lý đề tài' },
  { id: 'implementation-progress', label: 'Tiến độ thực hiện' },
  { id: 'research-data', label: 'Dữ liệu nghiên cứu' },
  { id: 'new-data', label: 'Nhập dữ liệu mới' },
  { id: 'process', label: 'Quy trình thực hiện' },
];
