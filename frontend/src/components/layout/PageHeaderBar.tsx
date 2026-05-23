type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Tiêu đề vùng nội dung chính — khớp header trang Tổng quan (màu brand + gạch dưới).
 * `subtitle` dùng cho các màn hình con (ví dụ bảng Kanban).
 */
export function HeaderBar({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="shrink-0 border-b border-chrome-divider bg-chrome-surface px-6 pb-4 pt-6">
      <h1 className="text-[21px] font-semibold leading-tight text-chrome-primary">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-chrome-text-muted">{subtitle}</p> : null}
    </header>
  );
}
