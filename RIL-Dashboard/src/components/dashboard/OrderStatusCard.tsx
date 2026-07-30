import { PieChart as PieIcon } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import CardHeader from '../ui/CardHeader';
import PieChart from '../PieChart';
import type { Segment } from '../../data/segments';

interface OrderStatusCardProps {
  data: Segment[];
  activeCount: number;
}

export default function OrderStatusCard({ data, activeCount }: OrderStatusCardProps) {
  return (
    <GlassCard bloom="info" className="flex h-full flex-col p-6">
      <CardHeader
        eyebrow="Order Pipeline"
        icon={PieIcon}
        title="Status Distribution"
        // subtitle="Hover a slice to expand the breakdown"
        pill={`${activeCount} ACTIVE`}
      />
      <div className="flex min-h-75 flex-1 items-center justify-center">
        <PieChart
          data={data}
          unit=""
          valuePrefix=""
          shareLabel="Share"
          shareUnitLabel="of active orders"
          totalLabel="Total Active"
          idleHint=""
          showTrend={false}
          ariaLabel="Order status distribution"
        />
      </div>
    </GlassCard>
  );
}
