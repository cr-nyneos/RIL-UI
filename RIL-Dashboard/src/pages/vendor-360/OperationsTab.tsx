import { Truck } from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import KeyValue from '../../components/ui/KeyValue';
import Section from '../../components/ui/Section';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatTime } from '../../lib/format';
import { dwellMinutes, formatDuration } from '../../lib/siteOpsStore';
import type { Movement } from '../../lib/types/siteOps';
import type { VendorSnapshot } from '../../lib/vendor360';

interface OperationsTabProps {
  snapshot: VendorSnapshot;
}

const RECENT_LIMIT = 8;

export default function OperationsTab({ snapshot }: OperationsTabProps) {
  const recent = [...snapshot.movements]
    .sort((a, b) => (b.entryAt ?? '').localeCompare(a.entryAt ?? ''))
    .slice(0, RECENT_LIMIT);

  const columns: Column<Movement>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      width: '150px',
      render: (movement) => <span className="text-body-strong tabular-nums">{movement.vehicle}</span>,
    },
    {
      key: 'direction',
      header: 'Direction',
      width: '120px',
      render: (movement) => <span className="text-body">{movement.direction}</span>,
    },
    {
      key: 'plant',
      header: 'Plant / Gate',
      width: '200px',
      render: (movement) => (
        <span className="text-body truncate">
          {movement.plant} · {movement.gate}
        </span>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      render: (movement) => <span className="text-body truncate">{movement.zone}</span>,
    },
    {
      key: 'entry',
      header: 'Entry',
      width: '110px',
      render: (movement) => (
        <span className="text-body tabular-nums">{movement.entryAt ? formatTime(movement.entryAt) : '—'}</span>
      ),
    },
    {
      key: 'dwell',
      header: 'Dwell',
      width: '100px',
      align: 'right',
      render: (movement) => (
        <span className="text-body tabular-nums">{formatDuration(dwellMinutes(movement))}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '150px',
      render: (movement) => <StatusBadge status={movement.status} size="sm" />,
    },
  ];

  return (
    <>
      <Section
        variant="flush"
        title="Site Presence"
        description="Live position of this vendor's vehicles and workforce."
      >
        <KeyValue
          columns={4}
          items={[
            { label: 'Vehicles On Site', value: snapshot.onSite.length },
            { label: 'Entries Logged', value: snapshot.entriesToday },
            { label: 'Exits Logged', value: snapshot.exitsToday },
            { label: 'Average Dwell', value: formatDuration(snapshot.averageDwellMinutes) },
            { label: 'Workforce On Site', value: snapshot.workforce },
            { label: 'Supervised Zones', value: snapshot.manpower.length },
            {
              label: 'Passes Expiring',
              value: snapshot.manpower.reduce((total, record) => total + record.passesExpiring, 0),
            },
            {
              label: 'Shift',
              value: snapshot.manpower[0]?.shift ?? null,
            },
          ]}
        />
      </Section>

      <Section
        variant="flush"
        title="Recent Gate Movements"
        description="The last movements recorded at the gate desk."
        padded={false}
      >
        <DataTable
          surface={false}
          minWidth="1040px"
          density="compact"
          columns={columns}
          rows={recent}
          rowKey={(movement) => movement.id}
          emptyState={
            <EmptyState
              icon={<Truck size={22} strokeWidth={2.1} />}
              title="No gate movements recorded"
              description="Vehicle entries and exits for this vendor appear here."
            />
          }
        />
      </Section>
    </>
  );
}
