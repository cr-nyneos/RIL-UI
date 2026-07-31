import { ArrowDownToLine, ArrowUpFromLine, Camera } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import ActivityFeed from '../../components/ui/ActivityFeed';
import Badge from '../../components/ui/Badge';
import DocumentRow from '../../components/ui/DocumentRow';
import JourneyCard, { type JourneyFact } from '../../components/ui/JourneyCard';
import KeyValue from '../../components/ui/KeyValue';
import { formatTime } from '../../lib/format';
import {
  currentStage,
  dwellMinutes,
  formatDuration,
  netWeight,
  scheduledArrival,
} from '../../lib/siteOpsStore';
import type { Movement } from '../../lib/types/siteOps';
import type { Tone } from '../../lib/types/ui';

interface MovementJourneyProps {
  movement: Movement;
  expanded: boolean;
  onToggle: () => void;
  highlight?: boolean;
  style?: CSSProperties;
}

function kilograms(value: number | null): string {
  return value === null ? '—' : `${value.toLocaleString('en-IN')} kg`;
}

function facts(movement: Movement): JourneyFact[] {
  const stage = currentStage(movement);
  const gate = `${movement.gate} · ${movement.plant}`;

  if (movement.status === 'Scheduled') {
    const arrival = scheduledArrival(movement);
    return [
      { label: 'Gate', value: gate },
      { label: 'Expected Arrival', value: arrival ? formatTime(arrival) : '—' },
      { label: 'Transporter', value: movement.transporter },
      { label: 'Material', value: movement.material },
    ];
  }

  if (movement.status === 'Exited') {
    return [
      { label: 'Gate', value: gate },
      { label: 'Entered', value: movement.entryAt ? formatTime(movement.entryAt) : '—' },
      { label: 'Exited', value: movement.exitAt ? formatTime(movement.exitAt) : '—' },
      { label: 'Total Dwell', value: formatDuration(dwellMinutes(movement)) },
    ];
  }

  return [
    { label: 'Current Stage', value: stage.label },
    { label: 'Location', value: movement.zone },
    { label: 'Time On Site', value: formatDuration(dwellMinutes(movement)) },
    { label: 'Expected Exit', value: formatTime(movement.expectedExit) },
  ];
}

function note(movement: Movement): { tone: Tone; text: string } | undefined {
  if (movement.status === 'Blocked' && movement.blockedReason) {
    return { tone: 'danger', text: movement.blockedReason };
  }
  if (movement.status === 'Delayed') {
    const stage = currentStage(movement);
    return {
      tone: 'warning',
      text: `${formatDuration(movement.delayMinutes ?? null)} behind the expected ${stage.label.toLowerCase()} slot.`,
    };
  }
  return undefined;
}

export default function MovementJourney({ movement, expanded, onToggle, highlight = false, style }: MovementJourneyProps) {
  const navigate = useNavigate();
  const net = netWeight(movement);

  return (
    <JourneyCard
      icon={
        movement.direction === 'Gate-In' ? (
          <ArrowDownToLine size={17} strokeWidth={2.2} />
        ) : (
          <ArrowUpFromLine size={17} strokeWidth={2.2} />
        )
      }
      title={movement.vehicle}
      subtitle={`${movement.direction} · ${movement.vendor}`}
      reference={{ label: movement.orderId, to: `/orders/${movement.orderId}` }}
      stages={movement.stages}
      status={movement.status}
      facts={facts(movement)}
      note={note(movement)}
      expanded={expanded}
      onToggle={onToggle}
      onOpen={() => navigate(`/site-operations/new?movement=${movement.id}`)}
      openLabel="Record Movement"
      className="animate-rise"
      style={
        highlight
          ? { ...style, borderColor: 'var(--color-brand-600)', boxShadow: '0 0 0 3px rgba(54, 92, 245, 0.16)' }
          : style
      }
    >
      <div className="grid gap-4">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-section)] p-4">
          <KeyValue
            columns={4}
            items={[
              { label: 'Movement', value: movement.id },
              { label: 'Driver', value: movement.driver },
              { label: 'Driver Contact', value: movement.driverContact },
              { label: 'Transporter', value: `${movement.transporter} · ${movement.vehicleType}` },
              { label: 'Security Pass', value: `${movement.pass.id} · ${movement.pass.status}` },
              { label: 'Gross / Tare', value: `${kilograms(movement.weighment.grossKg)} / ${kilograms(movement.weighment.tareKg)}` },
              { label: 'Net Weight', value: kilograms(net) },
              { label: 'Labour In / Out', value: `${movement.labourIn} / ${movement.labourOut}` },
              { label: 'Material', value: movement.material, span: 2 },
              { label: 'Remarks', value: movement.remarks ?? '—', span: 2 },
            ]}
          />
        </div>

        {movement.photos.length > 0 && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-section)] p-4">
            <div className="text-table-head mb-2">Site Photographs</div>
            <div className="flex flex-wrap gap-2">
              {movement.photos.map((photo) => (
                <Badge key={photo} tone="neutral" variant="glass" shape="square" icon={<Camera size={12} strokeWidth={2.3} />}>
                  {photo}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="text-table-head mb-2">Associated Documents</div>
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-section)]">
              {movement.documents.map((document) => (
                <DocumentRow key={document.id} {...document} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-table-head mb-2">Recent Activity</div>
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-section)]">
              <ActivityFeed entries={movement.activity} />
            </div>
          </div>
        </div>
      </div>
    </JourneyCard>
  );
}
