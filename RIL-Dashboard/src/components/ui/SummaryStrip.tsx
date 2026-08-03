export type SummaryTone = 'neutral' | 'danger' | 'warning' | 'success';

export interface SummaryItem {
  key: string;
  label: string;
  value: number | string;
  tone?: SummaryTone;
  active?: boolean;
}

interface SummaryStripProps {
  items: SummaryItem[];
  onSelect?: (key: string) => void;
  className?: string;
}

const TONE_COLOR: Record<SummaryTone, string> = {
  neutral: 'var(--color-ink-900)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  success: 'var(--color-success)',
};

export default function SummaryStrip({ items, onSelect, className = '' }: SummaryStripProps) {
  return (
    <div className={`flex items-stretch ${className}`}>
      {items.map((item, index) => {
        const tone = item.tone ?? 'neutral';
        const color = item.active ? 'var(--color-brand-700)' : TONE_COLOR[tone];

        const content = (
          <>
            <span className="text-kpi-label uppercase">{item.label}</span>
            <span className="text-[22px] leading-7 font-semibold tabular-nums" style={{ color }}>
              {item.value}
            </span>
            {item.active && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600" />
            )}
          </>
        );

        return (
          <div key={item.key} className="flex min-w-0 flex-1 items-stretch">
            {index > 0 && <span className="surface-divider w-px shrink-0" />}
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-pressed={item.active}
                className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-start justify-center gap-1 px-5 py-4 text-left transition-colors duration-150 hover:bg-[var(--color-surface-hover)]"
              >
                {content}
              </button>
            ) : (
              <div className="relative flex min-w-0 flex-1 flex-col items-start justify-center gap-1 px-5 py-4">
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
