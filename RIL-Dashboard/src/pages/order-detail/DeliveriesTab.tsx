import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';
import DocumentRow from '../../components/ui/DocumentRow';
import KeyValue from '../../components/ui/KeyValue';
import StatusBadge from '../../components/ui/StatusBadge';
import SummaryStrip from '../../components/ui/SummaryStrip';
import { formatDate, formatTime } from '../../lib/format';
import type { DeliveryTotals, OrderDetail, Shipment } from '../../lib/types/orderDetail';

interface DeliveriesTabProps {
  detail: OrderDetail;
  totals: DeliveryTotals;
}

export default function DeliveriesTab({ detail, totals }: DeliveriesTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const columns: Column<Shipment>[] = [
    {
      key: 'id',
      header: 'Shipment',
      width: '150px',
      render: (shipment) => (
        <div className="flex min-w-0 items-center gap-1.5">
          {expanded === shipment.id ? (
            <ChevronDown size={14} strokeWidth={2.6} className="flex-none text-ink-500" />
          ) : (
            <ChevronRight size={14} strokeWidth={2.6} className="flex-none text-ink-400" />
          )}
          <span className="truncate text-[14px] leading-5 font-semibold text-ink-900">{shipment.id}</span>
        </div>
      ),
    },
    {
      key: 'dispatch',
      header: 'Dispatch',
      width: '115px',
      render: (shipment) => (
        <span className="text-body tabular-nums">{formatDate(shipment.dispatch)}</span>
      ),
    },
    {
      key: 'mode',
      header: 'Mode',
      width: '80px',
      render: (shipment) => <span className="text-body">{shipment.mode}</span>,
    },
    {
      key: 'carrier',
      header: 'Carrier',
      width: '140px',
      render: (shipment) => <span className="text-body truncate">{shipment.carrier}</span>,
    },
    {
      key: 'vehicle',
      header: 'Vehicle / Flight',
      width: '170px',
      render: (shipment) => (
        <span className="text-body truncate tabular-nums" title={shipment.vehicle}>
          {shipment.vehicle}
        </span>
      ),
    },
    {
      key: 'window',
      header: 'Expected → Actual',
      width: '190px',
      render: (shipment) => {
        const late = shipment.actual !== null && shipment.actual > shipment.expected;
        return (
          <span className="text-body tabular-nums">
            {formatDate(shipment.expected)}
            {' → '}
            <span style={late ? { color: 'var(--color-danger)', fontWeight: 600 } : undefined}>
              {shipment.actual ? formatDate(shipment.actual) : '—'}
            </span>
          </span>
        );
      },
    },
    {
      key: 'quantities',
      header: 'Quantities',
      width: '190px',
      render: (shipment) => {
        const exceptions = shipment.missing + shipment.damaged;
        return (
          <div className="min-w-0">
            <div className="text-body-strong tabular-nums">
              {shipment.received === null
                ? `— / ${shipment.ordered} received`
                : `${shipment.received} / ${shipment.ordered} received`}
            </div>
            {exceptions > 0 && (
              <div
                className="text-[12px] leading-[18px] font-semibold tabular-nums"
                style={{ color: 'var(--color-danger)' }}
              >
                {shipment.missing} missing · {shipment.damaged} damaged
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'qc',
      header: 'QC Result',
      width: '130px',
      render: (shipment) => <StatusBadge status={shipment.qc} size="sm" />,
    },
  ];

  return (
    <>
      <div className="border-b border-[var(--color-border)]">
        <SummaryStrip
          items={[
            { key: 'ordered', label: 'Ordered', value: totals.ordered },
            { key: 'received', label: 'Received', value: totals.received },
            { key: 'missing', label: 'Missing', value: totals.missing, tone: 'danger' },
            { key: 'damaged', label: 'Damaged', value: totals.damaged, tone: 'danger' },
            { key: 'pending', label: 'Pending', value: totals.pending },
          ]}
        />
      </div>

      <DataTable
        surface={false}
        minWidth="1180px"
        columns={columns}
        rows={detail.shipments}
        rowKey={(shipment) => shipment.id}
        onRowClick={(shipment) => setExpanded((current) => (current === shipment.id ? null : shipment.id))}
        expandedKey={expanded}
        renderExpanded={(shipment) => (
          <>
            <KeyValue
              columns={4}
              items={[
                { label: 'Tracking Number', value: shipment.tracking },
                { label: 'Driver', value: shipment.driver === '—' ? null : shipment.driver },
                { label: 'Transporter', value: shipment.transporter },
                {
                  label: 'Gate-In',
                  value: shipment.gateIn
                    ? `${formatDate(shipment.gateIn.slice(0, 10))} · ${formatTime(shipment.gateIn)}`
                    : null,
                },
                { label: 'Weighment', value: shipment.weighment, span: 2 },
                { label: 'Remarks', value: shipment.remarks, span: 2 },
              ]}
            />

            <div className="surface-section mt-5 overflow-hidden">
              <h4 className="text-table-head surface-section-head px-5 py-2.5">Attached Documents</h4>
              {shipment.documents.map((document) => (
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
      />
    </>
  );
}
