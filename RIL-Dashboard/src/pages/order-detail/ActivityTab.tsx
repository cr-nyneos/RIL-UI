import { useState } from 'react';
import ActivityFeed from '../../components/ui/ActivityFeed';
import EmptyState from '../../components/ui/EmptyState';
import Tabs from '../../components/ui/Tabs';
import type { ActivityType, OrderDetail } from '../../lib/types/orderDetail';

type ActivityFilter = 'all' | ActivityType;

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'gate', label: 'Gates' },
  { key: 'delivery', label: 'Deliveries' },
  { key: 'document', label: 'Documents' },
  { key: 'finance', label: 'Finance' },
];

interface ActivityTabProps {
  detail: OrderDetail;
}

export default function ActivityTab({ detail }: ActivityTabProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const sorted = [...detail.activity].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const entries = filter === 'all' ? sorted : sorted.filter((entry) => entry.type === filter);

  return (
    <>
      <div className="surface-toolbar flex flex-wrap items-center gap-2.5 px-5 py-2.5">
        <Tabs
          tabs={FILTERS.map((item) => ({
            key: item.key,
            label: item.label,
            count: item.key === 'all' ? sorted.length : sorted.filter((e) => e.type === item.key).length,
          }))}
          active={filter}
          onChange={(key) => setFilter(key as ActivityFilter)}
          size="sm"
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No activity in this category" description="Switch back to All to see the full trail." />
      ) : (
        <ActivityFeed entries={entries} />
      )}
    </>
  );
}
