/** Inline error banner (not in screenshot spec — kept unobtrusive). */
export function LoginFormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-[10px] border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-center text-[13px] leading-snug text-red-800"
    >
      {message}
    </div>
  );
}
