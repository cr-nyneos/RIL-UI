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
  description?: string;
  module: NotificationModule;
  orderId: string;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  escalated: boolean;
  to?: string;
}

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  description?: string;
  duration: number;
  leaving: boolean;
}

export function notificationState(notification: AppNotification): NotificationState {
  if (notification.escalated) return 'Escalated';
  return notification.read ? 'Read' : 'Unread';
}
