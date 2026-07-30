import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  to?: string;
  icon?: LucideIcon;
  label: string;
  collapsed: boolean;
  disabled?: boolean;
  soon?: boolean;
  nested?: boolean;
  end?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({ to, icon: Icon, label, collapsed, disabled, soon, nested, end, onClick }: SidebarItemProps) {
  const content = (isActive: boolean) => (
    <div
      className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-[15px] transition-colors duration-180 ${
        nested ? 'pr-3.5 pl-4' : 'px-3.5'
      } ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive
          ? 'sidebar-item-active font-bold text-brand-800'
          : soon
            ? 'cursor-default font-semibold text-ink-600'
            : disabled
              ? 'cursor-default font-semibold text-sidebar-ink'
              : 'sidebar-item-hover font-semibold text-sidebar-ink hover:text-sidebar-hover-ink'
      }`}
    >
      {isActive && <span className="sidebar-item-indicator absolute top-1.5 bottom-1.5 left-0 w-0.75 rounded-full" />}
      {Icon ? (
        <Icon
          size={20}
          strokeWidth={2.1}
          className={`flex-none transition-colors duration-180 ${
            isActive
              ? 'text-brand-600'
              : soon || disabled
                ? 'text-sidebar-icon'
                : 'text-sidebar-icon group-hover:text-brand-600'
          }`}
        />
      ) : (
        <span
          className={`h-1.5 w-1.5 flex-none rounded-full transition-colors duration-180 ${
            isActive ? 'bg-brand-600' : 'bg-sidebar-icon group-hover:bg-brand-600'
          }`}
        />
      )}
      {!collapsed && <span className="truncate">{label}</span>}
      {soon && !collapsed && (
        <span className="ml-auto flex-none rounded-md bg-chip-neutral px-1.5 py-0.5 text-[10px] font-bold text-ink-500">
          Soon
        </span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content(false)}
      </button>
    );
  }

  if (disabled || soon || !to) {
    return <div aria-disabled>{content(false)}</div>;
  }

  return (
    <NavLink to={to} end={end ?? to === '/'}>
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}
