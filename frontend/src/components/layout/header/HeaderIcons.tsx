type IconProps = { className?: string };

export function HeaderHomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"
      />
    </svg>
  );
}

export function HeaderLogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"
      />
    </svg>
  );
}
