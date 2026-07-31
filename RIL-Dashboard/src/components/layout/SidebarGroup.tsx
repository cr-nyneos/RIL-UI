import { useRef, useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import SidebarFlyout from './SidebarFlyout';
import type { NavChild } from '../../lib/routes';

interface SidebarGroupProps {
  to: string;
  icon: LucideIcon;
  label: string;
  items: NavChild[];
  collapsed: boolean;
}

export default function SidebarGroup({ icon: Icon, label, items, collapsed }: SidebarGroupProps) {
  const { pathname } = useLocation();
  const inGroup = items.some((item) => pathname === item.to);
  const [open, setOpen] = useState(inGroup);
  const [lastPathname, setLastPathname] = useState(pathname);
  const railRef = useRef<HTMLButtonElement>(null);
  const [flyout, setFlyout] = useState<DOMRect | null>(null);
  const [pinned, setPinned] = useState(false);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (inGroup) setOpen(true);
    if (flyout) setFlyout(null);
    if (pinned) setPinned(false);
  }

  if (collapsed) {
    return (
      <>
        <button
          ref={railRef}
          type="button"
          aria-expanded={Boolean(flyout)}
          onMouseEnter={() => setFlyout(railRef.current?.getBoundingClientRect() ?? null)}
          onMouseLeave={() => !pinned && setFlyout(null)}
          onClick={() => {
            if (pinned) {
              setPinned(false);
              setFlyout(null);
              return;
            }
            setPinned(true);
            setFlyout(railRef.current?.getBoundingClientRect() ?? null);
          }}
          className="w-full cursor-pointer text-left"
        >
          <div
            className={`group relative flex items-center justify-center rounded-[var(--radius-md)] px-3 py-2 transition-colors duration-150 ${
              inGroup
                ? 'sidebar-item-active text-brand-800'
                : 'sidebar-item-hover text-sidebar-ink hover:text-sidebar-hover-ink'
            }`}
          >
            {inGroup && (
              <span className="sidebar-item-indicator absolute top-1 bottom-1 left-0 w-0.5 rounded-[var(--radius-sm)]" />
            )}
            <Icon
              size={18}
              strokeWidth={2.1}
              className={`flex-none transition-colors duration-180 ${
                inGroup ? 'text-brand-600' : 'text-sidebar-icon group-hover:text-brand-600'
              }`}
            />
          </div>
        </button>

        {flyout && (
          <SidebarFlyout
            anchor={flyout}
            align="top"
            interactive
            onMouseLeave={() => {
              setFlyout(null);
              setPinned(false);
            }}
          >
            <div className="surface-rail min-w-[196px] p-1.5">
              <span className="block px-3 pt-1 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-sidebar-group-label uppercase">
                {label}
              </span>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <SidebarItem key={item.to} to={item.to} label={item.label} collapsed={false} end />
                ))}
              </div>
            </div>
          </SidebarFlyout>
        )}
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-full cursor-pointer text-left"
      >
        <div
          className={`group relative flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[14px] transition-colors duration-150 ${
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
          <div className="relative mt-1 ml-5 flex flex-col gap-0.5 rounded-r-[var(--radius-md)] border-l border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] py-1 pl-2">
            {items.map((item) => (
              <SidebarItem key={item.to} to={item.to} label={item.label} collapsed={false} end />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
