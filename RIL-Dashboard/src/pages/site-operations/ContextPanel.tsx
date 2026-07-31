import PanelRow, { PanelEmpty as EmptyRow } from '../../components/ui/PanelRow';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import { formatDate, formatTime } from '../../lib/format';
import { dwellMinutes, formatDuration, isOnSite, scheduledArrival } from '../../lib/siteOpsStore';
import type { ManpowerRecord, Movement } from '../../lib/types/siteOps';

export function MovementContext({
  movements,
  averageDwellMinutes,
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

  return (
    <>
      <Section
        title="On Site Now"
        // description={`Longest dwell first · average ${formatDuration(averageDwellMinutes)}`}
        padded={false}
      >
        {onSite.length ? (
          onSite
            .slice(0, 6)
            .map((movement) => (
              <PanelRow
                key={movement.id}
                primary={movement.vehicle}
                secondary={`${movement.zone} · ${movement.plant}`}
                trailing={formatDuration(dwellMinutes(movement))}
              />
            ))
        ) : (
          <EmptyRow label="No vehicles inside the plant." />
        )}
      </Section>

      <Section title="Needs Attention" description="Halted journeys and vehicles held for exit clearance." padded={false}>
        {attention.length || pendingExit.length ? (
          <>
            {attention.map((movement) => (
              <PanelRow
                key={movement.id}
                tone={movement.status === 'Blocked' ? 'danger' : 'warning'}
                primary={movement.vehicle}
                secondary={movement.blockedReason ?? `Delayed at ${movement.zone}`}
                trailing={movement.status}
              />
            ))}
            {pendingExit.map((movement) => (
              <PanelRow
                key={movement.id}
                tone="brand"
                primary={movement.vehicle}
                secondary={`Cleared internally · waiting at ${movement.zone}`}
                trailing={formatTime(movement.expectedExit)}
              />
            ))}
          </>
        ) : (
          <EmptyRow label="Every movement is running to plan." />
        )}
      </Section>

      <Section title="Upcoming Movements" description="Arrival slots confirmed with transporters." padded={false}>
        {upcoming.length ? (
          upcoming.map((movement) => (
            <PanelRow
              key={movement.id}
              primary={movement.vehicle}
              secondary={`${movement.vendor} · ${movement.gate}`}
              trailing={formatTime(scheduledArrival(movement) ?? movement.expectedExit)}
            />
          ))
        ) : (
          <EmptyRow label="No further arrivals scheduled today." />
        )}
      </Section>
    </>
  );
}

export function ManpowerContext({ records }: { records: ManpowerRecord[] }) {
  const byPlant = records.reduce<Record<string, number>>((totals, record) => {
    totals[record.plant] = (totals[record.plant] ?? 0) + record.current;
    return totals;
  }, {});
  const plants = Object.entries(byPlant).sort((a, b) => b[1] - a[1]);
  const peak = Math.max(...plants.map(([, count]) => count), 1);
  const compliance = records
    .filter((record) => record.passesExpiring > 0)
    .sort((a, b) => b.passesExpiring - a.passesExpiring);

  return (
    <>
      <Section title="Workforce by Plant" description="Where the active headcount is deployed right now.">
        <div className="grid gap-4">
          {plants.map(([plant, count]) => (
            <div key={plant} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
              <span className="truncate text-[13px] leading-5 font-semibold text-ink-700">{plant}</span>
              <span className="text-[13px] leading-5 font-bold text-ink-900 tabular-nums">{count}</span>
              <ProgressMeter value={Math.round((count / peak) * 100)} className="col-span-2" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Access Compliance" description="Security passes approaching expiry by vendor." padded={false}>
        {compliance.length ? (
          compliance.map((record) => (
            <PanelRow
              key={record.id}
              tone="warning"
              primary={record.vendor}
              secondary={`Induction valid to ${formatDate(record.inductionValidTo)}`}
              trailing={`${record.passesExpiring} passes`}
            />
          ))
        ) : (
          <EmptyRow label="All personnel passes are current." />
        )}
      </Section>
    </>
  );
}
