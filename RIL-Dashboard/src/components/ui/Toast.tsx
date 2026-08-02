import { useEffect, useRef } from 'react';

import { useNotifications } from '../../lib/notifications/NotificationsContext';
import type { ToastTone } from '../../lib/types/notifications';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
  tone?: ToastTone;
}

export default function Toast({ message, onDismiss, duration, tone = 'success' }: ToastProps) {
  const { pushToast } = useNotifications();
  const pushed = useRef<string | null>(null);

  useEffect(() => {
    if (pushed.current === message) return;
    pushed.current = message;
    pushToast({ message, tone, duration });
    onDismiss();
  }, [message, tone, duration, pushToast, onDismiss]);

  return null;
}
