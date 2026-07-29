import { Waves } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import CardHeader from '../ui/CardHeader';
import BarChart from '../BarChart';
import type { Segment } from '../../data/segments';

interface PlantLoadCardProps {
  data: Segment[];
}

export default function PlantLoadCard({ data }: PlantLoadCardProps) {
  return (
    <GlassCard bloom="success" className="h-full p-6">
      <CardHeader
        eyebrow="Site Load"
        icon={Waves}
        title="Orders by Plant"
        subtitle="Hover a vessel to disturb the liquid & read its load"
        pill={`${data.length} SITES`}
      />
      <BarChart data={data} unit="" valuePrefix="" shareLabel="Share of active orders" showTrend={false} />
    </GlassCard>
  );
}
