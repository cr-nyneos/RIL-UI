export type SummaryTone = 'neutral' | 'danger' | 'warning';

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
  neutral: 'var(--color-ink-800)',
  danger: '#BE123C',
  warning: '#B45309',
};

export default function SummaryStrip({ items, onSelect, className = '' }: SummaryStripProps) {
  return (
    <div
      className={`glass-raised flex h-[72px] items-stretch rounded-2xl px-2 ${className}`}
      style={{ ['--bloom' as never]: 'rgba(99,102,241,0.05)' }}
    >
      {items.map((item, index) => {
        const tone = item.tone ?? 'neutral';
        const color = item.active ? 'var(--color-brand-700)' : TONE_COLOR[tone];

        const content = (
          <>
            <span className="text-[12px] leading-4 font-bold tracking-[0.09em] text-ink-500 uppercase">
              {item.label}
            </span>
            <span className="text-[24px] leading-7 font-extrabold tabular-nums" style={{ color }}>
              {item.value}
            </span>
            {item.active && (
              <span
                className="absolute inset-x-4 bottom-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg,#22D3EE,#8B5CF6)' }}
              />
            )}
          </>
        );

        return (
          <div key={item.key} className="flex min-w-0 flex-1 items-stretch">
            {index > 0 && <span className="my-4 w-px shrink-0" style={{ background: 'rgba(15,23,42,0.07)' }} />}
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-pressed={item.active}
                className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-xl px-6 transition-colors duration-200 hover:bg-[rgba(79,70,229,0.05)]"
              >
                {content}
              </button>
            ) : (
              <div className="relative flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 px-6">
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
