import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../lib/format';

export interface ActivityFeedEntry {
  id: string;
  actor: string;
  action: string;
  target?: { label: string; to?: string };
  /** ISO datetime. */
  timestamp: string;
  type: string;
}

interface ActivityFeedProps {
  entries: ActivityFeedEntry[];
  className?: string;
}

function groupByDay(entries: ActivityFeedEntry[]): { day: string; items: ActivityFeedEntry[] }[] {
  const groups = new Map<string, ActivityFeedEntry[]>();
  entries.forEach((entry) => {
    const day = entry.timestamp.slice(0, 10);
    const bucket = groups.get(day);
    if (bucket) bucket.push(entry);
    else groups.set(day, [entry]);
  });
  return [...groups.entries()].map(([day, items]) => ({ day, items }));
}

export default function ActivityFeed({ entries, className = '' }: ActivityFeedProps) {
  const groups = groupByDay(entries);

  return (
    <div className={className}>
      {groups.map((group) => (
        <section key={group.day}>
          <h3 className="text-table-head surface-toolbar sticky top-0 z-10 px-5 py-2">
            {formatDate(group.day)}
          </h3>
          {group.items.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 border-b border-[var(--color-glass-hairline)] px-5 py-3 last:border-b-0"
            >
              <p className="text-body min-w-0 flex-1">
                <span className="font-bold text-ink-900">{entry.actor}</span> {entry.action}
                {entry.target && ' '}
                {entry.target &&
                  (entry.target.to ? (
                    <Link
                      to={entry.target.to}
                      className="font-semibold text-brand-700 hover:underline hover:underline-offset-[3px]"
                    >
                      {entry.target.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink-800">{entry.target.label}</span>
                  ))}
              </p>
              <span className="text-meta flex-none tabular-nums">{formatTime(entry.timestamp)}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
