import type { CSSProperties } from 'react';

/** Shared field chrome — spec §4 */

export const inputBase =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

export const inputError = 'border-red-400 focus:ring-red-200';

export const selectBase =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat px-3 py-2 text-xs text-slate-800 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

/** Chevron via inline SVG data URL */
export const selectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
} satisfies CSSProperties;
