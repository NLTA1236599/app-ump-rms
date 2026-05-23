export type DashboardModule = {
  id: string;
  label: string;
  description: string;
  iconPath: string;
  iconBgClass: string;
  featured?: boolean;
  /** Optional status dot (e.g. notification) */
  showDot?: boolean;
};

/** Content aligned with `assets/docs/dashboard-overview-analysis.md` §4.4 */
export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    id: 'projects',
    label: 'Quản lý Dự án KHCN',
    description: 'Theo dõi tiến trình, kinh phí & sản phẩm đề tài',
    featured: true,
    iconBgClass: 'bg-chrome-primary',
    iconPath:
      'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  },
  {
    id: 'initiatives',
    label: 'Quản lý Sáng kiến',
    description: 'Đăng ký và xét duyệt các sáng kiến cải tiến',
    iconBgClass: 'bg-sky-500',
    iconPath:
      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    id: 'ethics',
    label: 'Quản lý Hồ sơ Y đức',
    description: 'Thẩm định đạo đức trong nghiên cứu y sinh',
    iconBgClass: 'bg-emerald-500',
    iconPath:
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    id: 'publications',
    label: 'Quản lý bài báo quốc tế',
    description: 'Thống kê ISI/Scopus và khen thưởng công bố',
    iconBgClass: 'bg-violet-500',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    id: 'hours',
    label: 'Quản lý giờ NCKH',
    description: 'Theo dõi giờ định mức và thực tế của giảng viên',
    iconBgClass: 'bg-amber-500',
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'conferences',
    label: 'Hội nghị hội thảo',
    description: 'Tổ chức và quản lý sự kiện khoa học công nghệ',
    showDot: true,
    iconBgClass: 'bg-rose-500',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    id: 'stats',
    label: 'Thống kê dữ liệu',
    description: 'Báo cáo thông minh và phân tích số liệu tổng hợp',
    iconBgClass: 'bg-slate-700',
    iconPath: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
  },
  {
    id: 'transfer',
    label: 'Chuyển giao công nghệ',
    description: 'Quản lý chuyển giao kết quả nghiên cứu & sở hữu trí tuệ',
    iconBgClass: 'bg-violet-700',
    iconPath: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
];
