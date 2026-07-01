import { formatDate } from '../DataTable/formatDate.js';

import { getUrgencyLevel } from './notificationUrgency.js';
import { DocumentTextIcon, PencilSquareIcon } from './notificationIcons.js';
import type { DeadlineNotification } from './types.js';

type NotificationItemProps = {
  item: DeadlineNotification;
  onView: () => void;
};

function formatDeadlineDisplay(date: Date): string {
  return formatDate(date.toISOString()) || '—';
}

function formatDaysRemainingText(item: DeadlineNotification): string {
  if (item.source === 'note') {
    return item.message ?? 'Ghi chú mới về đề tài';
  }

  if (item.daysRemaining < 0) {
    return `Quá hạn ${Math.abs(item.daysRemaining)} ngày — ${item.deadlineLabel}`;
  }
  return `Còn ${item.daysRemaining} ngày đến hạn ${item.deadlineLabel}`;
}

export function NotificationItem({ item, onView }: NotificationItemProps) {
  const urgency = item.source === 'note' ? getUrgencyLevel(30) : getUrgencyLevel(item.daysRemaining);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onView();
        }
      }}
      className={[
        'flex cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50',
        !item.isRead ? 'bg-blue-50/40' : '',
      ].join(' ')}
    >
      <div className="mt-1.5 w-2 shrink-0">
        {!item.isRead && <span className="block size-2 rounded-full bg-blue-500" aria-hidden />}
      </div>

      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${urgency.iconBg}`}
        aria-hidden
      >
        {item.entityType === 'project' ? (
          <DocumentTextIcon className={`size-4 ${urgency.iconColor}`} />
        ) : (
          <PencilSquareIcon className={`size-4 ${urgency.iconColor}`} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.title}</p>
        <p
          className={`mt-0.5 text-xs font-medium ${item.source === 'note' ? 'line-clamp-2 text-blue-600' : urgency.textColor}`}
        >
          {formatDaysRemainingText(item)}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {item.source === 'note'
            ? `Trao đổi · ${formatDeadlineDisplay(item.createdAt)}`
            : `Hạn: ${formatDeadlineDisplay(item.deadlineDate)}`}
        </p>
      </div>

      <span className="shrink-0 self-center text-xs font-medium text-blue-600">Xem</span>
    </div>
  );
}
