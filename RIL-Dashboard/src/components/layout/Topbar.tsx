import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/approvals': 'Approvals',
  '/vendors': 'Vendors',
  '/payments': 'Payments',
};

export default function Topbar() {
  const location = useLocation();
  const pageName = PAGE_NAMES[location.pathname] ?? 'NyneOS';

  return (
    <div className="animate-fade flex items-center justify-between px-1 py-1" style={{ animationDelay: '80ms' }}>
      <span className="text-[15px] font-semibold text-ink-700">{pageName}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="glass-inset relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 transition-colors duration-200 hover:text-ink-700"
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={2.1} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </button>
        <div className="glass-ring flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-brand-700))] text-xs font-semibold text-white">
          RS
        </div>
      </div>
    </div>
  );
}
