import { Activity } from 'lucide-react';
import ActivityFeed from '../../components/ui/ActivityFeed';
import EmptyState from '../../components/ui/EmptyState';
import type { VendorSnapshot } from '../../lib/vendor360';

interface ActivityTabProps {
  snapshot: VendorSnapshot;
}

export default function ActivityTab({ snapshot }: ActivityTabProps) {
  if (snapshot.activity.length === 0) {
    return (
      <EmptyState
        icon={<Activity size={22} strokeWidth={2.1} />}
        title="No activity recorded"
        description="Gate, delivery, document and finance events for this vendor appear here."
      />
    );
  }

  return <ActivityFeed entries={snapshot.activity} />;
}
