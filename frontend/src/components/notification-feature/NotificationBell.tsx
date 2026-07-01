import { useCallback, useEffect, useRef, useState } from 'react';

import { HEADER_IDENTITY_BG } from '../layout/header/headerConstants.js';

import { NotificationDropdown } from './NotificationDropdown.js';
import { useNotificationContext } from './NotificationProvider.js';
import { BellIcon, BellIconSolid } from './notificationIcons.js';
import { useClickOutside } from './useClickOutside.js';
import { useDeadlineNotifications } from './useDeadlineNotifications.js';
import type { DeadlineNotification } from './types.js';

export function NotificationBell() {
  const { projects, userId, refetch, onViewProject, onShowAllNotifications } =
    useNotificationContext();
  const { notifications, unreadCount, markAllRead, markOneRead } = useDeadlineNotifications({
    projects,
    userId,
    refetch,
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useClickOutside(containerRef, closeDropdown, isOpen);

  useEffect(() => {
    if (isOpen) {
      void refetch();
    }
  }, [isOpen, refetch]);

  const handleViewItem = useCallback(
    (item: DeadlineNotification) => {
      void markOneRead(item.id);
      setIsOpen(false);
      onViewProject(item.entityId);
    },
    [markOneRead, onViewProject],
  );

  const badgeBorderColor = HEADER_IDENTITY_BG;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          'relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-150',
          isOpen ? 'bg-white/15' : 'bg-transparent hover:bg-white/10',
        ].join(' ')}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <BellIconSolid className="size-5 text-white" />
        ) : (
          <BellIcon className="size-5 text-white" />
        )}
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 bg-red-500 px-1 text-[10px] font-bold text-white"
            style={{ borderColor: badgeBorderColor }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={closeDropdown}
          onMarkAllRead={() => void markAllRead()}
          onViewItem={handleViewItem}
          onShowAll={onShowAllNotifications}
        />
      )}
    </div>
  );
}
