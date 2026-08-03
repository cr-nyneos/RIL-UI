import {
  Workflow,
  Bell,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import SidebarGroup from './SidebarGroup';
import { PRIMARY_NAV } from '../../lib/routes';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ADMINISTRATION_NAV = [
  { icon: Workflow, label: 'Workflow Builder', to: '/workflow-builder' },
  { icon: Bell, label: 'Notifications', to: '/notifications' },
  { icon: BarChart3, label: 'Insights', to: '/insights' },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`surface-rail fixed top-0 left-0 z-40 flex h-screen flex-none flex-col overflow-hidden transition-all duration-300 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <nav className="scrollbar-subtle mt-[86px] flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5 pb-4">
        {!collapsed && (
          <span className="mt-1 mb-2.5 px-3 text-[12px] font-semibold tracking-widest text-sidebar-group-label uppercase">
            Operations
          </span>
        )}
        {PRIMARY_NAV.filter((item) => item.to !== '/workflow-builder').map((item) =>
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
          <span className="mb-2.5 px-3 text-[12px] font-semibold tracking-widest text-sidebar-group-label uppercase">
            Administration
          </span>
        )}
        {ADMINISTRATION_NAV.map((item) => (
          <SidebarItem
            key={item.label}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            soon={!item.to}
          />
        ))}
      </nav>

      <div className="flex flex-none flex-col gap-1 border-t border-[var(--color-rail-border)] bg-[var(--color-surface-rail-mark)] px-2.5 py-3.5">
        {/* <SidebarItem icon={Settings} label="Account & Settings" collapsed={collapsed} disabled /> */}
        <SidebarItem icon={LogOut} label="Log out" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </aside>
  );
}
