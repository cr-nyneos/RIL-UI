import { Waves } from 'lucide-react';
import CardHeader from '../ui/CardHeader';
import BarChart from '../BarChart';
import type { Segment } from '../../data/segments';

interface PlantLoadCardProps {
  data: Segment[];
}

export default function PlantLoadCard({ data }: PlantLoadCardProps) {
  return (
    <div className="flex h-full flex-col p-5">
      <CardHeader
        eyebrow="Site Load"
        icon={Waves}
        title="Orders by Plant"
        // subtitle="Hover a vessel to disturb the liquid & read its load"
        pill={`${data.length} SITES`}
      />
      <div className="min-h-75 flex-1">
        <BarChart data={data} unit="" valuePrefix="" shareLabel="Share of active orders" showTrend={false} />
      </div>
    </div>
  );
}
