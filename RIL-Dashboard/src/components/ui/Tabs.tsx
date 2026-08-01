import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
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
  style?: CSSProperties;
  size?: 'sm' | 'md';
  /**
   * `attached` shares the container's border so tabs and panel read as one object.
   * `bar` is the listing-page tab strip: filled active tab sitting on a hairline.
   */
  variant?: 'pill' | 'segmented' | 'attached' | 'bar';
  toggleOff?: boolean;
}

export default function Tabs({
  tabs,
  active,
  onChange,
  className = '',
  style,
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

  const attached = variant === 'attached';
  const bar = variant === 'bar';

  return (
    <div
      className={
        attached
          ? `surface-section-head relative flex items-stretch overflow-x-auto px-2 ${className}`
          : bar
            ? `relative flex items-stretch gap-1 overflow-x-auto border-b border-[var(--color-border-strong)] ${className}`
            : `glass-inset relative inline-flex rounded-[var(--radius-md)] p-1 ${className}`
      }
      style={style}
      role="tablist"
    >
      {attached && (
        <span
          aria-hidden
          className="tab-pill absolute bottom-[-1px] left-0 h-0.5 bg-brand-600"
          style={{
            transform: `translateX(${pill?.left ?? 0}px)`,
            width: pill?.width ?? 0,
            opacity: pill ? 1 : 0,
          }}
        />
      )}
      {variant === 'pill' && (
        <span
          aria-hidden
          className="tab-pill absolute top-1 bottom-1 left-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-selected)]"
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
            className={`relative z-1 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap transition-colors duration-150 ${
              attached
                ? 'h-11 px-3.5 text-[14px]'
                : bar
                  ? 'rounded-t-[var(--radius-md)] border-b-2 px-6 py-3 text-[14px]'
                  : `rounded-[var(--radius-sm)] ${size === 'sm' ? 'px-3 py-1.5 text-[13px]' : 'px-3.5 py-1.5 text-[14px]'}`
            } ${
              isActive
                ? `${variant === 'segmented' || bar ? 'bg-brand-600 text-white' : 'text-brand-700'} ${
                    bar ? 'border-brand-600' : ''
                  } font-bold`
                : `font-semibold ${
                    bar
                      ? 'border-transparent bg-[var(--color-brand-soft2)] text-ink-700 hover:bg-[var(--color-surface-hover)] hover:text-brand-700'
                      : 'text-ink-600 hover:bg-[var(--color-surface-hover)] hover:text-ink-900'
                  }`
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              isActive && (bar || variant === 'segmented') ? (
                <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-white/30 bg-white/20 px-1.5 py-0.5 text-[11px] leading-[14px] font-bold text-white tabular-nums">
                  {tab.count}
                </span>
              ) : (
                <Badge shape="square" size="xs" tone={isActive ? 'brand' : 'neutral'}>
                  {tab.count}
                </Badge>
              )
            )}
          </button>
        );
      })}
    </div>
  );
}
