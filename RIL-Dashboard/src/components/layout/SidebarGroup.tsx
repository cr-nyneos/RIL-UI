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
            className={`group relative flex items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-3 py-2.5 transition-colors duration-150 ${
              inGroup
                ? 'sidebar-item-active text-sidebar-active-ink'
                : 'sidebar-item-hover text-sidebar-ink hover:text-sidebar-hover-ink'
            }`}
          >
            {inGroup && (
              <span className="sidebar-item-indicator absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-[var(--radius-sm)]" />
            )}
            <Icon
              size={20}
              strokeWidth={2.1}
              className={`flex-none transition-colors duration-180 ${
                inGroup ? 'text-sidebar-active-icon' : 'text-sidebar-icon group-hover:text-sidebar-hover-ink'
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
            <div className="surface-rail-panel min-w-[210px] p-2">
              <span className="block px-3 pt-1 pb-2 text-[11px] font-bold tracking-widest text-sidebar-group-label uppercase">
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
          className={`group relative flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors duration-150 ${
            inGroup && !open
              ? 'sidebar-item-active font-semibold text-sidebar-active-ink'
              : 'sidebar-item-hover font-normal text-sidebar-ink hover:text-sidebar-hover-ink'
          }`}
        >
          {inGroup && !open && (
            <span className="sidebar-item-indicator absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-[var(--radius-sm)]" />
          )}
          <Icon
            size={20}
            strokeWidth={2.1}
            className={`flex-none transition-colors duration-180 ${
              inGroup && !open ? 'text-sidebar-active-icon' : 'text-sidebar-icon group-hover:text-sidebar-hover-ink'
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
          <div className="relative mt-1 ml-5 flex flex-col gap-0.5 rounded-r-[var(--radius-md)] border-l border-[var(--color-rail-border)] bg-[var(--color-surface-rail-nest)] py-1.5 pl-2">
            {items.map((item) => (
              <SidebarItem key={item.to} to={item.to} label={item.label} collapsed={false} end />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
