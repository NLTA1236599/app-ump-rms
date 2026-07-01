import { CheckCircleIcon } from './notificationIcons.js';
import { NotificationItem } from './NotificationItem.js';
import type { DeadlineNotification } from './types.js';

type NotificationDropdownProps = {
  notifications: DeadlineNotification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onViewItem: (item: DeadlineNotification) => void;
  onShowAll: () => void;
};

export function NotificationDropdown({
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onViewItem,
  onShowAll,
}: NotificationDropdownProps) {
  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-96 max-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      role="dialog"
      aria-label="Danh sách thông báo"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-400">{unreadCount} thông báo mới</p>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:underline"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircleIcon className="mb-3 size-12 text-emerald-400" />
            <p className="text-sm font-semibold text-slate-600">Không có thông báo mới</p>
            <p className="mt-1 text-xs text-slate-400">
              Không có đề tài sắp đến hạn hoặc ghi chú trao đổi mới.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationItem key={item.id} item={item} onView={() => onViewItem(item)} />
          ))
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-2.5 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            onShowAll();
          }}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
}
