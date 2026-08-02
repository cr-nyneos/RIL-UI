import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Building2,
  Columns3,
  Package,
  ShieldCheck,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

import { formatTimeAgo } from '../../lib/format';
import { notificationTarget, useNotifications } from '../../lib/notifications/NotificationsContext';
import type { AppNotification, NotificationModule } from '../../lib/types/notifications';

const MODULE_ICON: Record<NotificationModule, LucideIcon> = {
  Orders: Package,
  Approvals: ShieldCheck,
  'Site Operations': Warehouse,
  Finance: Wallet,
  Vendors: Building2,
  Execution: Columns3,
};

function accentFor(notification: AppNotification): string {
  if (notification.escalated || notification.priority === 'Critical') return 'var(--color-danger)';
  if (notification.priority === 'High') return 'var(--color-warning)';
  return 'var(--color-brand-600)';
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const latest = [...notifications]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const openNotification = (notification: AppNotification) => {
    markRead(notification.id);
    setOpen(false);
    navigate(notificationTarget(notification));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors ${
          open ? 'bg-[var(--color-surface-selected)]' : 'hover:bg-[var(--color-surface-hover)]'
        }`}
      >
        <Bell size={18} className={open ? 'text-brand-700' : 'text-ink-600'} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] leading-none font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{ position: 'absolute' }}
          className="animate-menu glass-raised top-full right-0 z-50 mt-2.5 w-[400px] shadow-[0_18px_40px_-18px_rgba(11,23,53,0.5)]"
        >
          <div className="flex items-center justify-between bg-[var(--color-surface-selected)] px-4 py-3">
            <span className="flex items-center gap-2.5">
              <Bell size={17} strokeWidth={2.2} className="text-brand-700" />
              <span className="text-[15px] leading-5 font-bold text-ink-900">Notifications</span>
            </span>
            {unreadCount > 0 && (
              <span className="text-[12px] leading-4 font-semibold text-brand-700">{unreadCount} unread</span>
            )}
          </div>

          <div className="scrollbar-subtle max-h-[380px] overflow-y-auto">
            {latest.map((notification) => {
              const Icon = MODULE_ICON[notification.module];
              const accent = accentFor(notification);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className="flex w-full cursor-pointer items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--color-surface-hover)]"
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-[var(--radius-md)]"
                    style={{ background: 'var(--color-brand-soft2)', color: accent }}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={`truncate text-[13.5px] leading-5 ${
                          notification.read ? 'font-medium text-ink-700' : 'font-bold text-ink-900'
                        }`}
                      >
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
                      )}
                    </span>
                    {notification.description && (
                      <span className="mt-0.5 block truncate text-[12.5px] leading-[18px] text-ink-600">
                        {notification.description}
                      </span>
                    )}
                    <span className="mt-1 block text-[11.5px] leading-4 font-semibold text-ink-500">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-selected)] px-4 py-3">
            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={markAllRead}
              className="cursor-pointer text-[12.5px] leading-4 font-semibold text-ink-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all as read
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="flex cursor-pointer items-center gap-1.5 text-[12.5px] leading-4 font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              View all
              <ArrowRight size={13} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
