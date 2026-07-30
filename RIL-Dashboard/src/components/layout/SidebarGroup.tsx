import { useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import type { NavChild } from '../../lib/routes';

interface SidebarGroupProps {
  to: string;
  icon: LucideIcon;
  label: string;
  items: NavChild[];
  collapsed: boolean;
}

export default function SidebarGroup({ to, icon: Icon, label, items, collapsed }: SidebarGroupProps) {
  const { pathname } = useLocation();
  const inGroup = items.some((item) => pathname === item.to);
  const [open, setOpen] = useState(inGroup);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (inGroup) setOpen(true);
  }

  if (collapsed) {
    return <SidebarItem to={to} icon={Icon} label={label} collapsed end />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-full text-left"
      >
        <div
          className={`group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[14px] transition-colors duration-150 ${
            inGroup && !open
              ? 'sidebar-item-active font-bold text-brand-800'
              : 'sidebar-item-hover font-semibold text-sidebar-ink hover:text-sidebar-hover-ink'
          }`}
        >
          {inGroup && !open && (
            <span className="sidebar-item-indicator absolute top-1 bottom-1 left-0 w-0.5 rounded-[var(--radius-sm)]" />
          )}
          <Icon
            size={18}
            strokeWidth={2.1}
            className={`flex-none transition-colors duration-180 ${
              inGroup && !open ? 'text-brand-600' : 'text-sidebar-icon group-hover:text-brand-600'
            }`}
          />
          <span className="truncate">{label}</span>
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            className={`ml-auto flex-none text-sidebar-icon transition-transform duration-250 ease-out ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative mt-0.5 ml-5 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-2">
            {items.map((item) => (
              <SidebarItem key={item.to} to={item.to} label={item.label} collapsed={false} end />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
