import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  to?: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  disabled?: boolean;
}

export default function SidebarItem({ to, icon: Icon, label, collapsed, disabled }: SidebarItemProps) {
  const content = (isActive: boolean) => (
    <div
      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition-colors duration-180 ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'sidebar-item-active font-bold text-kpi-brand-text'
          : disabled
            ? 'cursor-default font-semibold text-ink-300'
            : 'sidebar-item-hover font-semibold text-sidebar-ink hover:text-sidebar-hover-ink'
      }`}
    >
      {isActive && <span className="sidebar-item-indicator absolute top-1.5 bottom-1.5 left-0 w-0.75 rounded-full" />}
      <Icon
        size={20}
        strokeWidth={2.1}
        className={`flex-none transition-colors duration-180 ${
          isActive ? 'text-brand-600' : disabled ? 'text-ink-300' : 'text-sidebar-icon group-hover:text-brand-600'
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );

  if (disabled || !to) {
    return <div aria-disabled>{content(false)}</div>;
  }

  return (
    <NavLink to={to} end={to === '/'}>
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}
