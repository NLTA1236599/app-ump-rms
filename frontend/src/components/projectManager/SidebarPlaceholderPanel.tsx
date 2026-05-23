type SidebarPlaceholderPanelProps = {
  label: string;
};

export function SidebarPlaceholderPanel({ label }: SidebarPlaceholderPanelProps) {
  return (
    <div className="rounded-[14px] border border-chrome-divider bg-chrome-surface p-12 text-center text-chrome-text-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      Nội dung cho mục &ldquo;{label}&rdquo; đang được xây dựng.
    </div>
  );
}
