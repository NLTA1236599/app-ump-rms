type PageTitleBarProps = {
  title: string;
};

export function PageTitleBar({ title }: PageTitleBarProps) {
  return (
    <div className="my-1.5 w-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-slate-700">{title}</div>
  );
}
