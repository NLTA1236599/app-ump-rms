import type { ReactNode } from 'react';

/** White card — analysis §3 + §8 (`#c8d8eb` border, blue-tint shadow). */
export function LoginAuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-[#c8d8eb] bg-white px-7 py-6 shadow-[0_4px_20px_rgba(30,80,160,0.10)] md:px-8 md:py-7">
      {children}
    </div>
  );
}
