import {
  Menu,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import SidebarGroup from './SidebarGroup';
import Button from '../ui/Button';
import { PRIMARY_NAV } from '../../lib/routes';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const PHASE_2_NAV = [
  { icon: FileText, label: 'Documents' },
  { icon: Bell, label: 'Notifications' },
  { icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`glass-raised animate-slide-left sticky top-4 flex h-[calc(100vh-2rem)] flex-none flex-col overflow-hidden transition-[width] duration-250 ease-out ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      <div
        className={`flex h-16 flex-none items-center border-b border-[var(--color-border)] ${
          collapsed ? 'justify-between gap-0 px-2.5' : 'gap-2.5 px-4'
        }`}
      >
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-sm)] bg-brand-600 text-sm font-bold text-white">
          <Warehouse size={18} strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <span className="truncate text-[16px] font-bold tracking-tight text-ink-900">NyneOS</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={`flex-none p-0 ${collapsed ? 'h-7 w-7' : 'ml-auto h-8 w-8'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={16} />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2.5 py-3">
        {!collapsed && (
          <span className="mb-1.5 px-3 text-[11px] font-bold tracking-[0.08em] text-sidebar-group-label uppercase">
            Operations
          </span>
        )}
        {PRIMARY_NAV.map((item) =>
          item.children ? (
            <SidebarGroup
              key={item.label}
              to={item.to}
              icon={item.icon}
              label={item.label}
              items={item.children}
              collapsed={collapsed}
            />
          ) : (
            <SidebarItem key={item.label} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
          ),
        )}

        <div className="surface-divider mt-4 mb-3 h-px flex-none" />

        {!collapsed && (
          <span className="mb-1.5 px-3 text-[11px] font-bold tracking-[0.08em] text-sidebar-group-label uppercase">
            Phase 2
          </span>
        )}
        {PHASE_2_NAV.map((item) => (
          <SidebarItem key={item.label} icon={item.icon} label={item.label} collapsed={collapsed} soon />
        ))}
      </nav>

      <div className="flex-none border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-2.5 py-2.5">
        <SidebarItem icon={Settings} label="Account & Settings" collapsed={collapsed} disabled />
        <SidebarItem icon={LogOut} label="Log out" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}
