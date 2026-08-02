import {
  Menu,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
      className={`surface-rail animate-slide-left flex h-full flex-none flex-col overflow-hidden transition-[width] duration-250 ease-out ${
        collapsed ? 'w-[84px]' : 'w-[272px]'
      }`}
    >
      <div
        className={`surface-rail-mark flex h-[72px] flex-none items-center ${
          collapsed ? 'justify-center px-3' : 'gap-3 px-5'
        }`}
      >
        <Link
          to="/"
          aria-label="Go to dashboard"
          className="flex min-w-0 cursor-pointer items-center gap-3"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-rail-active)] text-sm font-bold text-white">
            <Warehouse size={21} strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[20px] leading-7 font-bold tracking-tight text-white">
                NyneOS
              </span>
              <span className="truncate text-[12px] leading-4 font-semibold tracking-[0.06em] text-sidebar-group-label uppercase">
                Vendor Mgmt
              </span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto h-9 w-9 flex-none cursor-pointer rail-icon-btn p-0"
            aria-label="Collapse sidebar"
          >
            <Menu size={18} />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex flex-none justify-center px-3 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-9 w-9 cursor-pointer rail-icon-btn p-0"
            aria-label="Expand sidebar"
          >
            <Menu size={18} />
          </Button>
        </div>
      )}

      <nav className="scrollbar-subtle flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3.5 py-4">
        {!collapsed && (
          <span className="mt-1 mb-2.5 px-3 text-[12px] font-bold tracking-widest text-sidebar-group-label uppercase">
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

        <div className="surface-rail-divider mt-5 mb-4 h-px flex-none" />

        {!collapsed && (
          <span className="mb-2.5 px-3 text-[12px] font-bold tracking-widest text-sidebar-group-label uppercase">
            Phase 2
          </span>
        )}
        {PHASE_2_NAV.map((item) => (
          <SidebarItem key={item.label} icon={item.icon} label={item.label} collapsed={collapsed} soon />
        ))}
      </nav>

      <div className="flex flex-none flex-col gap-1 border-t border-[var(--color-rail-border)] bg-[var(--color-surface-rail-mark)] px-3.5 py-3.5">
        <SidebarItem icon={Settings} label="Account & Settings" collapsed={collapsed} disabled />
        <SidebarItem icon={LogOut} label="Log out" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}
