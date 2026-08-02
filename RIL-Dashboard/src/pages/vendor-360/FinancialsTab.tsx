import { Receipt } from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import KeyValue from '../../components/ui/KeyValue';
import Section from '../../components/ui/Section';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../lib/format';
import type { VendorInvoice, VendorSnapshot } from '../../lib/vendor360';

interface FinancialsTabProps {
  snapshot: VendorSnapshot;
}

export default function FinancialsTab({ snapshot }: FinancialsTabProps) {
  const { financials, invoices } = snapshot;

  const columns: Column<VendorInvoice>[] = [
    {
      key: 'id',
      header: 'Invoice No',
      width: '140px',
      render: (invoice) => <span className="text-body-strong tabular-nums">{invoice.id}</span>,
    },
    {
      key: 'order',
      header: 'Order',
      width: '130px',
      render: (invoice) => <span className="text-body tabular-nums">{invoice.orderId}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '130px',
      align: 'right',
      render: (invoice) => <span className="text-body-strong tabular-nums">{formatCurrency(invoice.amountCr)}</span>,
    },
    {
      key: 'approval',
      header: 'Approval',
      width: '150px',
      render: (invoice) => <StatusBadge status={invoice.approval} size="sm" />,
    },
    {
      key: 'payment',
      header: 'Payment',
      width: '160px',
      render: (invoice) => <StatusBadge status={invoice.paymentStatus} size="sm" />,
    },
    {
      key: 'due',
      header: 'Due Date',
      width: '140px',
      render: (invoice) => <span className="text-body tabular-nums">{formatDate(invoice.due)}</span>,
    },
  ];

  return (
    <>
      <Section
        variant="flush"
        title="Financial Summary"
        description="Every invoice raised against this vendor's orders."
      >
        <KeyValue
          columns={4}
          items={[
            {
              label: 'Outstanding',
              value: `${formatCurrency(financials.outstandingCr)} · ${financials.outstandingCount} invoices`,
            },
            {
              label: 'Released Payments',
              value: `${formatCurrency(financials.releasedCr)} · ${financials.releasedCount} invoices`,
            },
            { label: 'SCF Status', value: financials.scfStatus },
            { label: 'Payment Health', value: financials.paymentHealth },
          ]}
        />
      </Section>

      <Section variant="flush" title="Invoices" padded={false}>
        <DataTable
          surface={false}
          minWidth="900px"
          columns={columns}
          rows={invoices}
          rowKey={(invoice) => `${invoice.orderId}-${invoice.id}`}
          emptyState={
            <EmptyState
              icon={<Receipt size={22} strokeWidth={2.1} />}
              title="No invoices raised"
              description="Invoices appear here once a milestone triggers billing."
            />
          }
        />
      </Section>
    </>
  );
}
