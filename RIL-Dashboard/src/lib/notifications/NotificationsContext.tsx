
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import ToastViewport from '../../components/ui/ToastViewport';
import { NOTIFICATIONS } from '../mockData/notifications';
import type {
  AppNotification,
  NotificationModule,
  NotificationPriority,
  ToastItem,
  ToastTone,
} from '../types/notifications';

export interface ToastInput {
  message: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

export interface NotifyInput {
  title: string;
  description?: string;
  module: NotificationModule;
  orderId?: string;
  priority?: NotificationPriority;
  to?: string;
  tone?: ToastTone;
  escalated?: boolean;
  toast?: boolean;
}

interface NotificationsApi {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastItem[];
  notify: (input: NotifyInput) => void;
  pushToast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  announceSignIn: () => void;
}

/* Fired one after another as the operator lands on the dashboard, so the
   workspace opens with the live queue instead of a silent screen. */
const SIGN_IN_ALERTS: { delay: number; toast: ToastInput }[] = [
  { delay: 900, toast: { message: 'Security Clearance completed', description: 'ORD-2044 moved to Document Verification', tone: 'success' } },
  { delay: 2600, toast: { message: 'Governance approval pending', description: 'Action required on the ₹2.8 Cr award', tone: 'info' } },
  { delay: 4300, toast: { message: 'QC deadline approaching', description: 'ORD-2047 breaches SLA in 2 hours', tone: 'warning' } },
];

const NotificationsContext = createContext<NotificationsApi | null>(null);

const TOAST_EXIT_MS = 180;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const nextId = useCallback((prefix: string) => {
    counter.current += 1;
    return `${prefix}-${Date.now()}-${counter.current}`;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  const pushToast = useCallback(
    ({ message, description, tone = 'success', duration = 3000 }: ToastInput) => {
      setToasts((current) => [
        ...current.slice(-3),
        { id: nextId('TST'), tone, message, description, duration, leaving: false },
      ]);
    },
    [nextId],
  );

  const notify = useCallback(
    ({
      title,
      description,
      module,
      orderId = '—',
      priority = 'Medium',
      to,
      tone = 'success',
      escalated = false,
      toast = true,
    }: NotifyInput) => {
      setNotifications((current) => [
        {
          id: nextId('NTF'),
          title,
          description,
          module,
          orderId,
          priority,
          timestamp: new Date().toISOString(),
          read: false,
          escalated,
          to,
        },
        ...current,
      ]);
      if (toast) pushToast({ message: title, description, tone });
    },
    [nextId, pushToast],
  );

  const markRead = useCallback((id: string, read = true) => {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, read } : notification)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }, []);

  const announceSignIn = useCallback(() => {
    SIGN_IN_ALERTS.forEach(({ delay, toast }) => {
      window.setTimeout(() => pushToast(toast), delay);
    });
  }, [pushToast]);

  const value = useMemo<NotificationsApi>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      toasts,
      notify,
      pushToast,
      dismissToast,
      markRead,
      markAllRead,
      announceSignIn,
    }),
    [notifications, toasts, notify, pushToast, dismissToast, markRead, markAllRead, announceSignIn],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsApi {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used inside NotificationsProvider');
  return context;
}

const MODULE_ROUTE: Record<NotificationModule, string> = {
  Orders: '/orders',
  Approvals: '/approvals',
  'Site Operations': '/site-operations',
  Finance: '/finance',
  Vendors: '/vendors',
  Execution: '/execution',
};

export function notificationTarget(notification: AppNotification): string {
  if (notification.to) return notification.to;
  if (notification.module === 'Orders' && notification.orderId.startsWith('ORD-')) {
    return `/orders/${notification.orderId}`;
  }
  return MODULE_ROUTE[notification.module];
}
