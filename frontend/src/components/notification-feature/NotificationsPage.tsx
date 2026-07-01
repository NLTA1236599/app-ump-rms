import { useMemo, useState, type ReactNode } from 'react';

import { CheckCircleIcon } from './notificationIcons.js';
import { NotificationItem } from './NotificationItem.js';
import { useNotificationContext } from './NotificationProvider.js';
import { useDeadlineNotifications } from './useDeadlineNotifications.js';
import type { DeadlineNotification, NotificationFilter } from './types.js';

type FilterTabProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function FilterTab({ active, onClick, children }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

type NotificationsPageProps = {
  onBack?: () => void;
};

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const { projects, userId, refetch, onViewProject } = useNotificationContext();
  const { notifications, unreadCount, markAllRead, markOneRead } = useDeadlineNotifications({
    projects,
    userId,
    refetch,
  });
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'overdue') return n.daysRemaining < 0;
      return true;
    });
  }, [notifications, filter]);

  const handleView = (item: DeadlineNotification) => {
    void markOneRead(item.id);
    onViewProject(item.entityId);
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Quay lại
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-800">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {unreadCount} mới
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-sm text-blue-600 hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
          Tất cả
        </FilterTab>
        <FilterTab active={filter === 'unread'} onClick={() => setFilter('unread')}>
          Chưa đọc
        </FilterTab>
        <FilterTab active={filter === 'overdue'} onClick={() => setFilter('overdue')}>
          Quá hạn
        </FilterTab>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircleIcon className="mb-3 size-12 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-600">Không có thông báo</p>
            <p className="mt-1 text-xs text-slate-400">
              {filter === 'all'
                ? 'Không có đề tài sắp đến hạn hoặc ghi chú trao đổi.'
                : filter === 'unread'
                  ? 'Bạn đã đọc tất cả thông báo.'
                  : 'Không có đề tài quá hạn.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <NotificationItem key={item.id} item={item} onView={() => handleView(item)} />
          ))
        )}
      </div>
    </div>
  );
}
