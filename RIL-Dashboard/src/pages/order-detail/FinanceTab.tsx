import { useState } from 'react';
import Button from '../../components/ui/Button';
import DataTable, { type Column } from '../../components/ui/DataTable';
import FloatingTooltip from '../../components/FloatingTooltip';
import KeyValue from '../../components/ui/KeyValue';
import Section from '../../components/ui/Section';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../lib/format';
import type { Invoice, OrderDetail } from '../../lib/types/orderDetail';

interface FinanceTabProps {
  detail: OrderDetail;
}

export default function FinanceTab({ detail }: FinanceTabProps) {
  const [tip, setTip] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const { scf } = detail;
  const locked = scf.blockedReason !== null;

  const columns: Column<Invoice>[] = [
    {
      key: 'id',
      header: 'Invoice No',
      width: '130px',
      render: (invoice) => <span className="text-body-strong tabular-nums">{invoice.id}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '130px',
      align: 'right',
      render: (invoice) => (
        <span className="text-body-strong tabular-nums">{formatCurrency(invoice.amountCr)}</span>
      ),
    },
    {
      key: 'match',
      header: 'Match',
      width: '150px',
      render: (invoice) => <StatusBadge status={invoice.match} size="sm" />,
    },
    {
      key: 'approval',
      header: 'Approval',
      width: '140px',
      render: (invoice) => <StatusBadge status={invoice.approval} size="sm" />,
    },
    {
      key: 'payment',
      header: 'Payment Status',
      width: '150px',
      render: (invoice) => <StatusBadge status={invoice.paymentStatus} size="sm" />,
    },
    {
      key: 'due',
      header: 'Due Date',
      width: '130px',
      render: (invoice) => (
        <span className="text-body tabular-nums">{formatDate(invoice.due)}</span>
      ),
    },
  ];

  return (
    <>
      <Section
        variant="flush"
        title="Invoices"
        description="Raised against this order's milestones."
        padded={false}
      >
        <DataTable
          surface={false}
          minWidth="900px"
          columns={columns}
          rows={detail.invoices}
          rowKey={(invoice) => invoice.id}
        />
      </Section>

      <Section
        variant="flush"
        title="Supply Chain Finance"
        description="Financing released by the dependency engine, not by invoice date."
        actions={
          <span
            onMouseEnter={(event) => {
              if (!locked) return;
              const rect = event.currentTarget.getBoundingClientRect();
              setTip({ left: rect.left, bottom: rect.bottom, width: rect.width });
            }}
            onMouseLeave={() => setTip(null)}
          >
            <Button variant="primary" size="sm" disabled={locked}>
              Trigger SCF
            </Button>
          </span>
        }
      >
        <KeyValue
          columns={4}
          items={[
            { label: 'Eligibility', value: scf.eligibility },
            { label: 'Trigger Milestone', value: scf.triggerMilestone },
            { label: 'Financed Amount', value: scf.financedCr === null ? null : formatCurrency(scf.financedCr) },
            { label: 'Status', value: scf.status },
          ]}
        />

        <p className="text-body mt-4 border-t border-[var(--color-border)] pt-4">{scf.condition}</p>

        {scf.blockedReason && (
          <p className="text-body mt-2" style={{ color: 'var(--color-danger)' }}>
            {scf.blockedReason}
          </p>
        )}
      </Section>

      <FloatingTooltip open={tip !== null} below={tip ?? undefined} gap={8}>
        <p className="text-[13px] leading-5 font-medium text-ink-700">{scf.blockedReason}</p>
      </FloatingTooltip>
    </>
  );
}
