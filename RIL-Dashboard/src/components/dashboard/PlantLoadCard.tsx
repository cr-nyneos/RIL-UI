import { Waves } from 'lucide-react';
import CardHeader from '../ui/CardHeader';
import BarChart from '../BarChart';
import type { Segment } from '../../data/segments';

interface PlantLoadCardProps {
  data: Segment[];
}

export default function PlantLoadCard({ data }: PlantLoadCardProps) {
  return (
    <div className="dash-chart-card flex h-full flex-col p-6">
      <CardHeader
        eyebrow="Site Load"
        icon={Waves}
        title="Orders by Plant"
        // subtitle="Hover a vessel to disturb the liquid & read its load"
        pill={`${data.length} SITES`}
      />
      <div className="dash-chart-stage min-h-75 flex-1 p-2">
        <BarChart data={data} unit="" valuePrefix="" shareLabel="Share of active orders" showTrend={false} />
      </div>
    </div>
  );
}
