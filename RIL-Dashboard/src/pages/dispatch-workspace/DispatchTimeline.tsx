import { CheckCircle2, Circle, Truck } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { ACTIVE_MILESTONE, ORDER_TIMELINE } from './constants';

export default function DispatchTimeline() {
  const activeIndex = ORDER_TIMELINE.findIndex((stage) => stage.key === ACTIVE_MILESTONE);

  return (
    <div className="space-y-2">
      {ORDER_TIMELINE.map((stage, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <div key={stage.key} className="relative pl-9">
            {index < ORDER_TIMELINE.length - 1 && (
              <span
                className="absolute left-[15px] top-9 h-[calc(100%-1rem)] w-px"
                style={{ background: done ? 'var(--color-brand-500)' : 'var(--color-glass-hairline-deep)' }}
              />
            )}
            <span className="absolute left-0 top-2.5 flex h-8 w-8 items-center justify-center">
              {done ? (
                <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />
              ) : active ? (
                <Truck size={18} strokeWidth={2.4} className="text-brand-700" />
              ) : (
                <Circle size={18} strokeWidth={2.4} className="text-ink-500" />
              )}
            </span>
            <div
              className={`glass-inset flex items-center justify-between gap-3 p-3 transition-all duration-200 ${
                active ? 'bg-[var(--wash-brand-active)]' : ''
              }`}
            >
              <span className={`truncate text-body-strong ${active ? 'text-brand-700' : ''}`}>{stage.label}</span>
              {active ? (
                <Badge tone="brand" variant="soft" size="xs">Active</Badge>
              ) : (
                <Badge tone="neutral" variant="glass" size="xs">{done ? 'Cleared' : 'Upcoming'}</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
