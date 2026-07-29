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
    <GlassCard bloom="info" className="h-full p-6">
      <CardHeader
        eyebrow="Order Pipeline"
        icon={PieIcon}
        title="Status Distribution"
        subtitle="Hover a slice to expand the breakdown"
        pill={`${activeCount} ACTIVE`}
      />
      <PieChart
        data={data}
        unit=""
        valuePrefix=""
        shareLabel="Share"
        shareUnitLabel="of active orders"
        totalLabel="Total Active"
        idleHint="Hover a slice for the breakdown"
        showTrend={false}
        ariaLabel="Order status distribution"
      />
    </GlassCard>
  );
}
