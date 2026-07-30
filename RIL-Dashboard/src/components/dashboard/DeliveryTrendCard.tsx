import LineChart, { type LinePoint } from '../LineChart';

interface DeliveryTrendCardProps {
  actual: LinePoint[];
  planned: LinePoint[];
}

export default function DeliveryTrendCard({ actual, planned }: DeliveryTrendCardProps) {
  return (
    <div className="flex h-full flex-col p-5">
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
    </div>
  );
}
