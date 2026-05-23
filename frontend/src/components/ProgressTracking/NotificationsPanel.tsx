import { badgeClassesForTone } from './announcementStyles.js';
import { DEMO_ANNOUNCEMENTS } from './notificationsData.js';

type NotificationsPanelProps = {
  /** When omitted, renders demo copy from product spec */
  items?: typeof DEMO_ANNOUNCEMENTS;
};

function formatViMediumDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Zone 1 — spec §3 */
export function NotificationsPanel({ items = DEMO_ANNOUNCEMENTS }: NotificationsPanelProps) {
  return (
    <section
      aria-label="Thông báo và sự kiện"
      className="rounded-[24px] bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700">Thông báo &amp; sự kiện</p>
        <button
          type="button"
          className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
        >
          Xem tất cả
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl px-1 py-2 text-left transition-colors duration-150 hover:bg-slate-50 sm:px-2"
            >
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeClassesForTone(item.tone)}`}
              >
                {item.tag}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm font-medium text-slate-800">{item.title}</span>
              <time dateTime={item.at.toISOString()} className="mt-0.5 block text-xs text-slate-400">
                {formatViMediumDate(item.at)}
              </time>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
