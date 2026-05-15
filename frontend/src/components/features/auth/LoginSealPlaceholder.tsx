/** Placeholder until official seal loads (`/ump-seal.png`). Override size via `className`. */
export function LoginSealPlaceholder({ className = 'size-[110px]' }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-ump-navy bg-white shadow-sm ${className}`}
      aria-hidden
    >
      <span className="text-center text-[11px] font-extrabold leading-tight text-ump-navy">UMP</span>
    </div>
  );
}
