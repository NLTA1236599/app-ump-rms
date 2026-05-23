type PageTitleBarProps = {
  title: string;
};

export function PageTitleBar({ title }: PageTitleBarProps) {
  return (
    <div className="my-3 w-full bg-gray-100 px-4 py-3 text-sm text-slate-700">{title}</div>
  );
}
