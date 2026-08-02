import DataTable, { type Column } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import ProgressMeter from '../../components/ui/ProgressMeter';
import SectionCard from '../../components/ui/SectionCard';
import { formatDate, formatTime } from '../../lib/format';
import { dwellMinutes, formatDuration, isOnSite, scheduledArrival } from '../../lib/siteOpsStore';
import { toneToken } from '../../lib/tone';
import type { ManpowerRecord, Movement } from '../../lib/types/siteOps';
import type { Tone } from '../../lib/types/ui';

function Primary({ label, secondary, tone }: { label: string; secondary: string; tone?: Tone }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      {tone && (
        <span
          aria-hidden
          className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: toneToken(tone).fill }}
        />
      )}
      <div className="min-w-0">
        <div className="truncate text-[13px] leading-5 font-semibold text-ink-900 tabular-nums">{label}</div>
        <div className="truncate text-[12px] leading-4 text-ink-500">{secondary}</div>
      </div>
    </div>
  );
}

function Trailing({ value }: { value: string }) {
  return <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{value}</span>;
}

type AttentionRow = { movement: Movement; tone: Tone; secondary: string; trailing: string };

export function MovementContext({
  movements,
}: {
  movements: Movement[];
  averageDwellMinutes: number | null;
}) {
  const onSite = movements
    .filter(isOnSite)
    .sort((a, b) => (dwellMinutes(b) ?? 0) - (dwellMinutes(a) ?? 0));
  const attention = movements.filter((movement) => movement.status === 'Blocked' || movement.status === 'Delayed');
  const pendingExit = movements.filter((movement) => movement.status === 'Awaiting Exit');
  const upcoming = movements
    .filter((movement) => movement.status === 'Scheduled')
    .sort((a, b) => (scheduledArrival(a) ?? '').localeCompare(scheduledArrival(b) ?? ''));

  const attentionRows: AttentionRow[] = [
    ...attention.map((movement) => ({
      movement,
      tone: (movement.status === 'Blocked' ? 'danger' : 'warning') as Tone,
      secondary: movement.blockedReason ?? `Delayed at ${movement.zone}`,
      trailing: movement.status,
    })),
    ...pendingExit.map((movement) => ({
      movement,
      tone: 'brand' as Tone,
      secondary: `Cleared internally · waiting at ${movement.zone}`,
      trailing: formatTime(movement.expectedExit),
    })),
  ];

  const onSiteColumns: Column<Movement>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (movement) => <Primary label={movement.vehicle} secondary={`${movement.zone} · ${movement.plant}`} />,
    },
    {
      key: 'dwell',
      header: 'Dwell',
      align: 'right',
      render: (movement) => <Trailing value={formatDuration(dwellMinutes(movement))} />,
    },
  ];

  const attentionColumns: Column<AttentionRow>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row) => <Primary label={row.movement.vehicle} secondary={row.secondary} tone={row.tone} />,
    },
    {
      key: 'state',
      header: 'State',
      align: 'right',
      render: (row) => <Trailing value={row.trailing} />,
    },
  ];

  const upcomingColumns: Column<Movement>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (movement) => <Primary label={movement.vehicle} secondary={`${movement.vendor} · ${movement.gate}`} />,
    },
    {
      key: 'eta',
      header: 'ETA',
      align: 'right',
      render: (movement) => <Trailing value={formatTime(scheduledArrival(movement) ?? movement.expectedExit)} />,
    },
  ];

  return (
    <>
      <SectionCard title="On Site Now" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={onSiteColumns}
          rows={onSite.slice(0, 6)}
          rowKey={(movement) => movement.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No vehicles inside the plant." />}
        />
      </SectionCard>

      <SectionCard title="Needs Attention" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={attentionColumns}
          rows={attentionRows}
          rowKey={(row) => row.movement.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="Every movement is running to plan." />}
        />
      </SectionCard>

      <SectionCard title="Upcoming Movements" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={upcomingColumns}
          rows={upcoming}
          rowKey={(movement) => movement.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No further arrivals scheduled today." />}
        />
      </SectionCard>
    </>
  );
}

type PlantRow = { plant: string; count: number; share: number };

export function ManpowerContext({ records }: { records: ManpowerRecord[] }) {
  const byPlant = records.reduce<Record<string, number>>((totals, record) => {
    totals[record.plant] = (totals[record.plant] ?? 0) + record.current;
    return totals;
  }, {});
  const plants = Object.entries(byPlant).sort((a, b) => b[1] - a[1]);
  const peak = Math.max(...plants.map(([, count]) => count), 1);
  const plantRows: PlantRow[] = plants.map(([plant, count]) => ({
    plant,
    count,
    share: Math.round((count / peak) * 100),
  }));
  const compliance = records
    .filter((record) => record.passesExpiring > 0)
    .sort((a, b) => b.passesExpiring - a.passesExpiring);

  const plantColumns: Column<PlantRow>[] = [
    {
      key: 'plant',
      header: 'Plant',
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] leading-5 font-semibold text-ink-900">{row.plant}</div>
          <ProgressMeter value={row.share} className="mt-1.5" />
        </div>
      ),
    },
    {
      key: 'count',
      header: 'Headcount',
      align: 'right',
      render: (row) => <Trailing value={String(row.count)} />,
    },
  ];

  const complianceColumns: Column<ManpowerRecord>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      render: (record) => (
        <Primary
          label={record.vendor}
          secondary={`Induction valid to ${formatDate(record.inductionValidTo)}`}
          tone="warning"
        />
      ),
    },
    {
      key: 'passes',
      header: 'Passes',
      align: 'right',
      render: (record) => <Trailing value={`${record.passesExpiring}`} />,
    },
  ];

  return (
    <>
      <SectionCard title="Workforce by Plant" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={plantColumns}
          rows={plantRows}
          rowKey={(row) => row.plant}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No active workforce on site." />}
        />
      </SectionCard>

      <SectionCard title="Access Compliance" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={complianceColumns}
          rows={compliance}
          rowKey={(record) => record.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="All personnel passes are current." />}
        />
      </SectionCard>
    </>
  );
}
