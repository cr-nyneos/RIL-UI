import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import Badge from './Badge';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'pill' | 'segmented';
  toggleOff?: boolean;
}

export default function Tabs({
  tabs,
  active,
  onChange,
  className = '',
  size = 'md',
  variant = 'pill',
  toggleOff = false,
}: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const node = refs.current[active];
    if (!node) {
      setPill(null);
      return;
    }
    setPill({ left: node.offsetLeft, width: node.offsetWidth });
  }, [active]);

  useLayoutEffect(measure, [measure, tabs]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const handleChange = (key: string) => {
    onChange(toggleOff && key === active ? 'all' : key);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const next = (index + dir + tabs.length) % tabs.length;
    refs.current[tabs[next].key]?.focus();
  };

  return (
    <div
      className={`glass-inset relative inline-flex rounded-[var(--radius-md)] p-1 ${className}`}
      role="tablist"
    >
      {variant === 'pill' && (
        <span
          aria-hidden
          className="tab-pill absolute top-1 bottom-1 left-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white"
          style={{
            transform: `translateX(${pill?.left ?? 0}px)`,
            width: pill?.width ?? 0,
            opacity: pill ? 1 : 0,
          }}
        />
      )}
      {tabs.map((tab, index) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              refs.current[tab.key] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`relative z-1 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] transition-colors duration-150 ${
              size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-3.5 py-1.5 text-[14px]'
            } ${
              isActive
                ? `${variant === 'segmented' ? 'bg-brand-600 text-white' : 'text-brand-700'} font-bold`
                : 'font-semibold text-ink-600 hover:text-ink-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge shape="square" size="xs" tone={isActive ? 'brand' : 'neutral'}>
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
