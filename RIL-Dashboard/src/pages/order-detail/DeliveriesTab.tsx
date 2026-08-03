import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import DocumentRow from '../../components/ui/DocumentRow';
import Drawer from '../../components/ui/Drawer';
import EmptyState from '../../components/ui/EmptyState';
import JourneyRail from '../../components/ui/JourneyRail';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatTime } from '../../lib/format';
import type { JourneyStage } from '../../lib/types/siteOps';
import type { DeliveryTotals, OrderDetail, Shipment } from '../../lib/types/orderDetail';

interface DeliveriesTabProps {
  detail: OrderDetail;
  totals: DeliveryTotals;
}

function isLate(shipment: Shipment): boolean {
  return shipment.actual !== null && shipment.actual > shipment.expected;
}

function deliveryStatus(shipment: Shipment): string {
  if (shipment.actual === null) return 'In Transit';
  if (shipment.received === null) return 'Awaiting Inspection';
  if (shipment.received < shipment.ordered) return 'Partially Delivered';
  return 'Delivered';
}

function shipmentStages(shipment: Shipment): JourneyStage[] {
  const arrived = shipment.actual !== null;
  const qc = shipment.qc.toLowerCase();
  const failed = qc.includes('fail');
  const passed = qc.includes('pass');

  return [
    { key: 'dispatch', label: 'Dispatch', state: 'complete' },
    {
      key: 'transit',
      label: 'Transit',
      state: arrived ? (isLate(shipment) ? 'delayed' : 'complete') : 'current',
    },
    {
      key: 'gate-in',
      label: 'Gate-In',
      state: shipment.gateIn ? 'complete' : arrived ? 'current' : 'upcoming',
    },
    {
      key: 'qc',
      label: 'QC',
      state: failed ? 'blocked' : passed ? 'complete' : shipment.gateIn ? 'current' : 'upcoming',
    },
  ];
}

export default function DeliveriesTab({ detail, totals }: DeliveriesTabProps) {
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);

  const receivedPercent = totals.ordered > 0 ? Math.round((totals.received / totals.ordered) * 100) : 0;

  return (
    <>
      <div className="border-b border-[var(--color-border)] px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-kpi-label uppercase">Delivered</span>
            <span className="text-[26px] leading-8 font-semibold text-ink-900 tabular-nums">
              {totals.received} / {totals.ordered}
            </span>
          </div>

          <div className="flex items-baseline gap-5">
            <span
              className="text-[13px] leading-5 font-semibold tabular-nums"
              style={{ color: totals.missing > 0 ? 'var(--color-danger)' : 'var(--color-ink-500)' }}
            >
              {totals.missing} missing
            </span>
            <span
              className="text-[13px] leading-5 font-semibold tabular-nums"
              style={{ color: totals.damaged > 0 ? 'var(--color-danger)' : 'var(--color-ink-500)' }}
            >
              {totals.damaged} damaged
            </span>
            <span className="text-body-strong tabular-nums">{receivedPercent}%</span>
          </div>
        </div>

        <ProgressMeter value={receivedPercent} className="mt-4" />
      </div>

      {detail.shipments.length === 0 ? (
        <EmptyState
          title="No shipments yet"
          description="Shipments appear here once dispatch is logged against this order."
        />
      ) : (
        <ul>
          {detail.shipments.map((shipment, index) => (
            <li
              key={shipment.id}
              className="animate-rise flex flex-wrap items-center gap-x-8 gap-y-5 border-b border-[var(--color-glass-hairline)] px-6 py-5 transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-surface-hover)]"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="w-24 flex-none text-[15px] leading-6 font-semibold text-ink-900 tabular-nums">
                {shipment.id}
              </span>

              <JourneyRail
                stages={shipmentStages(shipment)}
                size="sm"
                showTimes={false}
                className="min-w-70 flex-1"
              />

              <div className="ml-auto flex flex-none items-center gap-3">
                <StatusBadge status={deliveryStatus(shipment)} size="sm" />
                <Button
                  variant="link"
                  size="sm"
                  icon={<ArrowRight size={15} strokeWidth={2.4} />}
                  iconPosition="right"
                  className="cursor-pointer"
                  onClick={() => setDetailShipment(shipment)}
                >
                  View Details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={detailShipment !== null}
        title={detailShipment?.id ?? ''}
        description={detailShipment ? `${detailShipment.carrier} · ${detailShipment.mode}` : undefined}
        onClose={() => setDetailShipment(null)}
      >
        {detailShipment && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3.5">
              <StatusBadge status={deliveryStatus(detailShipment)} size="sm" />
              <StatusBadge status={`QC ${detailShipment.qc}`} size="sm" />
            </div>

            <div className="border-b border-[var(--color-border)] p-5">
              <KeyValue
                columns={2}
                items={[
                  { label: 'Vehicle / Flight', value: detailShipment.vehicle },
                  { label: 'Tracking Number', value: detailShipment.tracking },
                  { label: 'Dispatch', value: formatDate(detailShipment.dispatch) },
                  { label: 'Expected', value: formatDate(detailShipment.expected) },
                  {
                    label: 'Actual',
                    value: detailShipment.actual ? (
                      <span style={isLate(detailShipment) ? { color: 'var(--color-danger)' } : undefined}>
                        {formatDate(detailShipment.actual)}
                      </span>
                    ) : null,
                  },
                  {
                    label: 'Gate-In',
                    value: detailShipment.gateIn
                      ? `${formatDate(detailShipment.gateIn.slice(0, 10))} · ${formatTime(detailShipment.gateIn)}`
                      : null,
                  },
                  { label: 'Ordered', value: detailShipment.ordered },
                  {
                    label: 'Received',
                    value: detailShipment.received === null ? null : detailShipment.received,
                  },
                  {
                    label: 'Missing',
                    value: (
                      <span style={detailShipment.missing > 0 ? { color: 'var(--color-danger)' } : undefined}>
                        {detailShipment.missing}
                      </span>
                    ),
                  },
                  {
                    label: 'Damaged',
                    value: (
                      <span style={detailShipment.damaged > 0 ? { color: 'var(--color-danger)' } : undefined}>
                        {detailShipment.damaged}
                      </span>
                    ),
                  },
                  { label: 'Driver', value: detailShipment.driver === '—' ? null : detailShipment.driver },
                  { label: 'Transporter', value: detailShipment.transporter },
                  { label: 'Weighment', value: detailShipment.weighment, span: 2 },
                  { label: 'Remarks', value: detailShipment.remarks, span: 2 },
                ]}
              />
            </div>

            <div>
              <h3 className="text-table-head surface-section-head px-5 py-2.5">Attached Documents</h3>
              {detailShipment.documents.map((document) => (
                <DocumentRow
                  key={document.id}
                  name={document.name}
                  type={document.type}
                  status={document.status}
                  uploadedBy={document.uploadedBy}
                  uploadedAt={document.uploadedAt ? formatDate(document.uploadedAt) : undefined}
                  size={document.size}
                />
              ))}
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
