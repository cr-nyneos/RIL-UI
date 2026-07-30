import { Waypoints } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import CardHeader from '../ui/CardHeader';
import LineChart, { type LinePoint } from '../LineChart';

interface DeliveryTrendCardProps {
  actual: LinePoint[];
  planned: LinePoint[];
}

export default function DeliveryTrendCard({ actual, planned }: DeliveryTrendCardProps) {
  return (
    <GlassCard bloom="none" className="flex h-full flex-col p-6">
      <CardHeader
        eyebrow="Delivery Trend"
        icon={Waypoints}
        title="Planned vs Actual"
        // subtitle="Hover the current to read each month"
        pill="LAST 6 MONTHS"
      />
      <div className="min-h-85 flex-1 max-[560px]:min-h-65">
        <LineChart
          data={actual}
          secondaryData={planned}
          unit=""
          valuePrefix=""
          primaryLabel="Actual"
          secondaryLabel="Planned"
          periodLabel="Deliveries"
          changeLabel="MoM change"
          ariaLabel="Monthly deliveries, planned vs actual"
          fillHeight
        />
      </div>
    </GlassCard>
  );
}
