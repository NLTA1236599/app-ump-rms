import type { ReactNode } from 'react';
import type { DeTaiKhcnSidebarItemId } from './deTaiKhcnSidebarNav.js';

type IconProps = { className?: string };

function IconOverview({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}

function IconProgress({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m4 14V9m4 10V7m4 12v-4m4 4V11" />
    </svg>
  );
}

function IconFolder({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
      />
    </svg>
  );
}

function IconPlusCircle({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

function IconDocument({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 4h6l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v4h4M8 13h8M8 17h5" />
    </svg>
  );
}

function IconDocumentDuplicate({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2M8 7H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"
      />
    </svg>
  );
}

const iconClass = 'h-5 w-5 shrink-0';

export function DeTaiKhcnSidebarIcon({ id }: { id: DeTaiKhcnSidebarItemId }): ReactNode {
  switch (id) {
    case 'tong-quan':
      return <IconOverview className={iconClass} />;
    case 'tien-do-thuc-hien':
      return <IconProgress className={iconClass} />;
    case 'du-lieu-de-tai':
      return <IconFolder className={iconClass} />;
    case 'nhap-moi-du-lieu':
      return <IconPlusCircle className={iconClass} />;
    case 'ke-khai-ho-so':
      return <IconDocument className={iconClass} />;
    case 'loc-trung-de-tai':
      return <IconDocumentDuplicate className={iconClass} />;
    default: {
      const _n: never = id;
      return _n;
    }
  }
}
