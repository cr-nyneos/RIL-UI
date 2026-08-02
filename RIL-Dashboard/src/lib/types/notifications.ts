export type NotificationPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type NotificationModule =
  | 'Orders'
  | 'Approvals'
  | 'Site Operations'
  | 'Finance'
  | 'Vendors'
  | 'Execution';

export type NotificationState = 'Escalated' | 'Unread' | 'Read';

export interface AppNotification {
  id: string;
  title: string;
  module: NotificationModule;
  orderId: string;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  escalated: boolean;
}

export function notificationState(notification: AppNotification): NotificationState {
  if (notification.escalated) return 'Escalated';
  return notification.read ? 'Read' : 'Unread';
}
