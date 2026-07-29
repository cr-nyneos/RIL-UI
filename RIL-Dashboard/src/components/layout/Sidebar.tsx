import {
  Menu,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Building2,
  Wallet,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Droplets,
} from 'lucide-react';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const PRIMARY_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: Package, label: 'Orders' },
  { to: '/approvals', icon: ShieldCheck, label: 'Approvals' },
  { to: '/vendors', icon: Building2, label: 'Vendors' },
  { to: '/payments', icon: Wallet, label: 'Payments' },
];

const PHASE_2_NAV = [
  { icon: FileText, label: 'Documents' },
  { icon: Bell, label: 'Notifications' },
  { icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`glass-raised sticky top-4 flex h-[calc(100vh-2rem)] flex-none flex-col overflow-hidden rounded-3xl transition-[width] duration-250 ease-out ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      <div className={`flex items-center gap-2.5 px-4 pt-5 pb-4 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-soft2 text-brand-600">
          <Droplets size={18} strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <span className="truncate font-display text-[15px] font-semibold tracking-tight text-ink-900">NyneOS</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-glass-fill-deep hover:text-ink-700 ${
            collapsed ? 'hidden' : ''
          }`}
          aria-label="Collapse sidebar"
        >
          <Menu size={16} />
        </button>
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mb-2 flex h-8 w-8 flex-none items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-glass-fill-deep hover:text-ink-700"
          aria-label="Expand sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5">
        {PRIMARY_NAV.map((item) => (
          <SidebarItem key={item.label} {...item} collapsed={collapsed} />
        ))}

        <div className={`mt-5 mb-1.5 px-3 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-[0.14em] text-ink-300 uppercase">Phase 2</span>
          )}
        </div>
        {PHASE_2_NAV.map((item) => (
          <SidebarItem key={item.label} icon={item.icon} label={item.label} collapsed={collapsed} disabled />
        ))}
      </nav>

      <div className="border-t border-glass-hairline px-2.5 py-3">
        <SidebarItem icon={Settings} label="Account & Settings" collapsed={collapsed} disabled />
      </div>
    </aside>
  );
}
