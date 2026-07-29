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
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200 ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'bg-brand-soft2 text-brand-600'
          : disabled
            ? 'cursor-default text-ink-400'
            : 'text-ink-500 hover:bg-glass-fill-deep hover:text-ink-700'
      }`}
    >
      {isActive && <span className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-brand-600" />}
      <Icon size={17} strokeWidth={2.1} className="flex-none" />
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
