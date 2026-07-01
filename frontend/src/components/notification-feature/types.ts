export type NotificationEntityType = 'project' | 'note';

export type NotificationSource = 'deadline' | 'note';

export interface DeadlineNotification {
  id: string;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message?: string;
  deadlineDate: Date;
  daysRemaining: number;
  deadlineLabel: string;
  isRead: boolean;
  createdAt: Date;
  source: NotificationSource;
  noteNotificationId?: string;
}

export type NotificationFilter = 'all' | 'unread' | 'overdue';
