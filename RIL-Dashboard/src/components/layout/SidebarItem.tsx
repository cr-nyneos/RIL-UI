import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import SidebarFlyout from './SidebarFlyout';

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
  const rowRef = useRef<HTMLDivElement>(null);
  const [tipAnchor, setTipAnchor] = useState<DOMRect | null>(null);

  const content = (isActive: boolean) => (
    <div
      ref={rowRef}
      onMouseEnter={() => collapsed && setTipAnchor(rowRef.current?.getBoundingClientRect() ?? null)}
      onMouseLeave={() => setTipAnchor(null)}
      className={`group relative flex items-center gap-3.5 overflow-hidden rounded-[var(--radius-md)] py-2.5 text-[14.5px] transition-colors duration-150 ${
        nested ? 'pr-3.5 pl-4' : 'px-3'
      } ${
        collapsed ? 'justify-center' : ''
      } ${soon || disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
        isActive
          ? 'sidebar-item-active font-bold text-sidebar-active-ink'
          : soon
            ? 'font-semibold text-sidebar-icon/70'
            : disabled
              ? 'font-semibold text-sidebar-ink'
              : 'sidebar-item-hover font-semibold text-sidebar-ink hover:text-sidebar-hover-ink'
      }`}
    >
      {isActive && <span className="sidebar-item-indicator absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-[var(--radius-sm)]" />}
      {Icon ? (
        <Icon
          size={20}
          strokeWidth={2.1}
          className={`flex-none transition-colors duration-180 ${
            isActive
              ? 'text-sidebar-active-icon'
              : soon || disabled
                ? 'text-sidebar-icon'
                : 'text-sidebar-icon group-hover:text-sidebar-hover-ink'
          }`}
        />
      ) : (
        <span
          className={`h-1.5 w-1.5 flex-none rounded-full transition-colors duration-180 ${
            isActive ? 'bg-sidebar-active-icon' : 'bg-sidebar-icon group-hover:bg-sidebar-hover-ink'
          }`}
        />
      )}
      {!collapsed && <span className="truncate">{label}</span>}
      {soon && !collapsed && (
        <span className="ml-auto flex-none rounded-[var(--radius-sm)] border border-[var(--color-rail-border)] bg-[var(--color-surface-rail-mark)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sidebar-group-label uppercase">
          Soon
        </span>
      )}
      {collapsed && tipAnchor && (
        <SidebarFlyout anchor={tipAnchor}>
          <span className="block rounded-[var(--radius-sm)] bg-ink-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-[var(--shadow-glass)]">
            {label}
          </span>
        </SidebarFlyout>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full cursor-pointer text-left">
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
