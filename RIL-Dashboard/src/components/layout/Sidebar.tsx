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
      <div className={`flex items-center pt-5 pb-4 ${collapsed ? 'justify-between gap-0 px-2.5' : 'gap-2.5 px-4'}`}>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-500),var(--color-violet-500))] text-sm font-extrabold text-white">
          <Warehouse size={20} strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <span className="truncate text-[17px] font-extrabold tracking-tight text-ink-900">NyneOS</span>
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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5">
        {PRIMARY_NAV.map((item) => (
          <SidebarItem key={item.label} {...item} collapsed={collapsed} />
        ))}

        <div className={`mt-7 mb-2.5 px-3 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && (
            <span className="text-[11px] font-bold tracking-[0.14em] text-sidebar-group-label uppercase">
              Phase 2
            </span>
          )}
        </div>
        {PHASE_2_NAV.map((item) => (
          <SidebarItem key={item.label} icon={item.icon} label={item.label} collapsed={collapsed} soon />
        ))}

       
      </nav>

      <div className="border-t border-glass-hairline px-2.5 py-3">
        <SidebarItem icon={LogOut} label="Log out" collapsed={collapsed} onClick={handleLogout} />
        <SidebarItem icon={Settings} label="Account & Settings" collapsed={collapsed} disabled />
      </div>
    </aside>
  );
}
