import { useMemo, useState } from 'react';
import { ClipboardCheck, MoreHorizontal, PackagePlus } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ExceptionFlags from '../components/ui/ExceptionFlags';
import KeyValue from '../components/ui/KeyValue';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import StageRail from '../components/ui/StageRail';
import StatusBadge from '../components/ui/StatusBadge';
import Tabs, { type TabItem } from '../components/ui/Tabs';
import Toast from '../components/ui/Toast';
import TypeBadge from '../components/ui/TypeBadge';

import ActivityTab from './order-detail/ActivityTab';
import CompletionFileTab from './order-detail/CompletionFileTab';
import DeliveriesTab from './order-detail/DeliveriesTab';
import DocumentsTab from './order-detail/DocumentsTab';
import FinanceTab from './order-detail/FinanceTab';
import StakeholdersTab from './order-detail/StakeholdersTab';
import TimelineTab from './order-detail/TimelineTab';

import { formatCurrency, formatDate } from '../lib/format';
import { useOrderDetail } from '../lib/orderDetailStore';
import type { DeliveryTotals, OrderDetail as OrderDetailModel } from '../lib/types/orderDetail';

type OrderTab =
  | 'timeline'
  | 'deliveries'
  | 'documents'
  | 'stakeholders'
  | 'finance'
  | 'completion'
  | 'activity';

const TABS: TabItem[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'deliveries', label: 'Deliveries' },
  { key: 'documents', label: 'Documents & Gates' },
  { key: 'stakeholders', label: 'Stakeholders' },
  { key: 'finance', label: 'Finance' },
  { key: 'completion', label: 'Completion File' },
  { key: 'activity', label: 'Activity' },
];

const VALID_TABS = new Set(TABS.map((tab) => tab.key));

function awardDate(detail: OrderDetailModel): string | null {
  const dates = detail.milestones
    .flatMap((milestone) => [
      milestone.timestamp,
      ...(milestone.history ?? []).map((entry) => entry.at.slice(0, 10)),
    ])
    .filter((value): value is string => Boolean(value))
    .sort();

  return dates[0] ?? null;
}

function exceptionText(totals: DeliveryTotals) {
  const exceptions = [];
  if (totals.missing > 0) exceptions.push(`${totals.missing} missing`);
  if (totals.damaged > 0) exceptions.push(`${totals.damaged} damaged`);
  return exceptions.join(' / ');
}

function renderTab(
  tab: OrderTab,
  orderId: string,
  detail: OrderDetailModel,
  totals: DeliveryTotals,
  notify: (message: string) => void,
) {
  switch (tab) {
    case 'deliveries':
      return <DeliveriesTab detail={detail} totals={totals} />;
    case 'documents':
      return <DocumentsTab detail={detail} onNotify={notify} />;
    case 'stakeholders':
      return <StakeholdersTab orderId={orderId} detail={detail} onNotify={notify} />;
    case 'finance':
      return <FinanceTab detail={detail} />;
    case 'completion':
      return <CompletionFileTab detail={detail} />;
    case 'activity':
      return <ActivityTab detail={detail} />;
    case 'timeline':
    default:
      return <TimelineTab detail={detail} orderId={orderId} />;
  }
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const { order, detail, totals } = useOrderDetail(id);

  const activeTab = useMemo<OrderTab>(() => {
    const requested = searchParams.get('tab') ?? 'timeline';
    return VALID_TABS.has(requested) ? (requested as OrderTab) : 'timeline';
  }, [searchParams]);

  if (!order || !detail || !id) {
    return (
      <AppShell>
        <Section title="Order Detail">
          <EmptyState
            title="Order not found"
            description="Return to the order register and choose a valid order."
          />
        </Section>
      </AppShell>
    );
  }

  const exceptionSummary = exceptionText(totals);
  const hasExceptions = order.flags.length > 0 || totals.missing > 0 || totals.damaged > 0;
  const awarded = awardDate(detail);

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <PageHeader
          size="lg"
          rule
          title={order.id}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Orders', to: '/orders' },
            { label: order.id },
          ]}
          actions={
            <>
              <StatusBadge status={order.status} />
              <TypeBadge type={order.type} />
              <Button
                variant="secondary"
                icon={<PackagePlus size={16} strokeWidth={2.2} />}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/orders/${order.id}/gates/delivery`, {
                    state: { from: `/orders/${order.id}?tab=timeline`, fromLabel: 'Order' },
                  })
                }
              >
                Log Shipment
              </Button>
              <Button
                variant="secondary"
                icon={<ClipboardCheck size={16} strokeWidth={2.2} />}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/orders/${order.id}/gates/qc`, {
                    state: { from: `/orders/${order.id}?tab=timeline`, fromLabel: 'Order' },
                  })
                }
              >
                Record Inspection
              </Button>
              <Button
                variant="icon"
                aria-label="More actions"
                title="Export / Print"
                icon={<MoreHorizontal size={17} strokeWidth={2.4} />}
                onClick={() => setToast('Export and print actions are stubbed for the POC.')}
              />
            </>
          }
        />

        <Section
          title="Order Summary"
          padded={false}
          actions={<StageRail stages={detail.milestones} compact={false} />}
        >
          <div className="p-5">
            <KeyValue
              columns={4}
              items={[
                { label: 'PO Number', value: order.po },
                { label: 'Vendor', value: order.vendor },
                { label: 'Contract Type', value: order.type },
                { label: 'Plant', value: order.plant },
                { label: 'Contract Value', value: formatCurrency(order.valueCr) },
                { label: 'Award Date', value: awarded ? formatDate(awarded) : null },
                { label: 'Expected Delivery', value: formatDate(order.expected) },
                { label: 'Progress', value: `${order.progress}%` },
              ]}
            />
          </div>

          {hasExceptions && (
            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-5 py-3">
              <ExceptionFlags flags={order.flags} />
              {order.flags.map((flag, index) => (
                <span key={`${flag.type}-${index}`} className="text-body">
                  {flag.detail}
                </span>
              ))}
              {exceptionSummary && (
                <span
                  className="text-[13px] leading-5 font-bold tabular-nums"
                  style={{ color: 'var(--color-danger)' }}
                >
                  {exceptionSummary}
                </span>
              )}
            </div>
          )}
        </Section>

        <section className="surface-section overflow-hidden">
          <header className="surface-section-head" aria-label="Order detail tabs">
            <Tabs
              tabs={TABS}
              active={activeTab}
              onChange={(key) => setSearchParams({ tab: key })}
              variant="attached"
            />
          </header>
          <div>{renderTab(activeTab, order.id, detail, totals, setToast)}</div>
        </section>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
