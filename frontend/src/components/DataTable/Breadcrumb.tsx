import type { BreadcrumbItem } from './types.js';

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
};

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="mb-0 flex items-center gap-1 py-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center">
          {index > 0 && <span className="mx-1 text-slate-400">&gt;</span>}
          {item.href ? (
            <button
              type="button"
              onClick={() => onNavigate?.(item.href!)}
              className="cursor-pointer text-slate-500 hover:text-blue-600"
            >
              {item.label}
            </button>
          ) : (
            <span className="cursor-default font-medium text-blue-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
