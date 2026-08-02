const DATE_LOCALE = 'en-IN';

export function formatCurrency(valueCr: number): string {
  return `₹${valueCr.toFixed(1)} Cr`;
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  return new Intl.DateTimeFormat(DATE_LOCALE, options ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatRelative(value: string | Date, clock: Date = new Date(), complete = false): string {
  if (complete) return 'Completed';
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  const today = new Date(clock);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today';
  return `in ${diff} days`;
}

export function formatTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(DATE_LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatTimeAgo(value: string | Date, clock: Date = new Date()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const minutes = Math.round((clock.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
