import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Section from '../components/ui/Section';
import SectionCard from '../components/ui/SectionCard';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import SummaryStrip from '../components/ui/SummaryStrip';
import Tabs from '../components/ui/Tabs';
import Toast from '../components/ui/Toast';

import { submitDecision, useApprovals } from '../lib/approvalsStore';
import { useNotifications } from '../lib/notifications/NotificationsContext';
import type { ToastTone } from '../lib/types/notifications';
import { ORDER_PLANTS } from '../lib/mockData/orders';
import type { DecisionAction, DecisionSubmission, DecisionTrack, PendingDecision } from '../lib/types/approvals';
import DecisionItem from './approvals/DecisionItem';
import DecisionModal from './approvals/DecisionModal';
import QueueContext from './approvals/QueueContext';

type QueueFilter = 'all' | 'mine' | 'team' | 'urgent';
type TrackFilter = 'all' | DecisionTrack;

const TRACK_OPTIONS: { value: TrackFilter; label: string }[] = [
  { value: 'all', label: 'All tracks' },
  { value: 'security', label: 'Security' },
  { value: 'documents', label: 'Documents' },
  { value: 'qc', label: 'QC' },
  { value: 'governance', label: 'Governance' },
  { value: 'finance', label: 'Finance' },
];

const GROUPS: { key: PendingDecision['urgency']; label: string; description: string }[] = [
  { key: 'breached', label: 'Needs A Decision Now',description:'' },
  { key: 'today', label: 'Due Today', description: '' },
  { key: 'scheduled', label: 'Scheduled', description: '' },
];

const ACTION_TOAST: Record<DecisionAction, (decision: PendingDecision, submission: DecisionSubmission) => string> = {
  approve: (decision) => `${decision.gateLabel} approved on ${decision.order.id}. Next gate unlocked.`,
  reject: (decision) => `${decision.gateLabel} returned to ${decision.owner.name} on ${decision.order.id}.`,
  escalate: (decision) => `${decision.gateLabel} escalated on ${decision.order.id}.`,
  delegate: (decision, submission) => `${decision.gateLabel} delegated to ${submission.delegateTo}.`,
};

const ACTION_TONE: Record<DecisionAction, ToastTone> = {
  approve: 'success',
  reject: 'error',
  escalate: 'warning',
  delegate: 'info',
};

function matches(decision: PendingDecision, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    decision.id,
    decision.order.id,
    decision.order.po,
    decision.order.vendor,
    decision.order.plant,
    decision.gateLabel,
    decision.trackLabel,
    decision.owner.name,
    decision.owner.role,
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function FeedSkeleton() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-section)] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <Skeleton variant="rect" width="180px" height="38px" />
            <Skeleton variant="rect" width="96px" height="20px" />
          </div>
          <div className="mt-5">
            <Skeleton variant="text" lines={2} />
          </div>
          <div className="mt-5">
            <Skeleton variant="rect" height="28px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Approvals() {
  const { decisions, records, summary } = useApprovals();
  const { notify } = useNotifications();

  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState<QueueFilter>('all');
  const [track, setTrack] = useState<TrackFilter>('all');
  const [plant, setPlant] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [active, setActive] = useState<{ decision: PendingDecision; action: DecisionAction } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // A refresh settles the feed rather than snapping — the queue is live data.
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const plantOptions = useMemo(
    () => [{ value: 'all', label: 'All plants' }, ...ORDER_PLANTS.map((value) => ({ value, label: value }))],
    [],
  );

  const scoped = useMemo(
    () =>
      decisions.filter((decision) => {
        if (!matches(decision, query)) return false;
        if (track !== 'all' && decision.track !== track) return false;
        if (plant !== 'all' && decision.order.plant !== plant) return false;
        return true;
      }),
    [decisions, plant, query, track],
  );

  const filtered = useMemo(
    () =>
      scoped.filter((decision) => {
        if (queue === 'mine') return decision.mine;
        if (queue === 'team') return decision.myTeam;
        if (queue === 'urgent') return decision.urgency === 'breached' || decision.escalated;
        return true;
      }),
    [queue, scoped],
  );

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: filtered.filter((decision) => decision.urgency === group.key),
      })).filter((group) => group.items.length > 0),
    [filtered],
  );

  const tabs = [
    { key: 'all', label: 'All', count: scoped.length },
    // { key: 'mine', label: 'Mine', count: scoped.filter((decision) => decision.mine).length },
    { key: 'team', label: 'My Team', count: scoped.filter((decision) => decision.myTeam).length },
    {
      key: 'urgent',
      label: 'Urgent',
      count: scoped.filter((decision) => decision.urgency === 'breached' || decision.escalated).length,
    },
  ];

  function handleSubmit(submission: DecisionSubmission) {
    if (!active) return;
    setSubmitting(true);
    const { decision } = active;

    window.setTimeout(() => {
      submitDecision(decision, submission);
      setSubmitting(false);
      setActive(null);
      setExpanded((current) => (current === decision.id ? null : current));
      notify({
        title: ACTION_TOAST[submission.action](decision, submission),
        description: `${decision.order.id} · ${decision.gateLabel}`,
        module: 'Approvals',
        orderId: decision.order.id,
        priority: submission.action === 'escalate' ? 'Critical' : 'Medium',
        escalated: submission.action === 'escalate',
        tone: ACTION_TONE[submission.action],
        to: '/approvals',
      });
    }, 600);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Approvals"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Approvals', to: '/approvals' },
              { label: tabs.find((item) => item.key === queue)?.label ?? 'All' },
            ]}
          />
          {/* <p className="text-meta mt-1">
            Decisions waiting on {CURRENT_USER.name} and the {CURRENT_USER.role.toLowerCase()} team.
          </p> */}
        </div>

        <Section padded={false} className="animate-rise" style={{ animationDelay: '60ms' }}>
          <SummaryStrip
            items={[
              { key: 'all', label: 'Waiting', value: summary.waiting },
              { key: 'urgent', label: 'Urgent', value: summary.urgent, tone: 'danger' },
              { key: 'due', label: 'Due Today', value: summary.dueToday, tone: 'warning' },
              { key: 'cleared', label: 'Cleared Today', value: summary.clearedToday },
            ]}
          />
        </Section>

        <div className="animate-rise flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: '90ms' }}>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search order, vendor, gate"
                className="w-full sm:w-[260px]"
              />
              <Button
                variant="secondary"
                icon={<SlidersHorizontal size={16} strokeWidth={2.3} />}
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
                className="cursor-pointer"
              >
                Filter
              </Button>
              <Button
                variant="secondary"
                icon={<RefreshCw size={16} strokeWidth={2.3} />}
                aria-label="Refresh approvals"
                onClick={() => {
                  setLoading(true);
                  setToast('Approvals queue refreshed.');
                }}
                className="cursor-pointer"
              />
            </div>

            <Tabs
              tabs={tabs}
              active={queue}
              onChange={(key) => setQueue(key as QueueFilter)}
              className="order-2 ml-auto"
            />
            {filtersOpen && (
              <div className="animate-fade-fast order-3 flex w-full flex-wrap items-center gap-2">
                <Select
                  value={track}
                  onChange={setTrack}
                  options={TRACK_OPTIONS}
                  ariaLabel="Decision track"
                  className="min-w-[160px]"
                />
                <Select
                  value={plant}
                  onChange={setPlant}
                  options={plantOptions}
                  ariaLabel="Plant"
                  className="min-w-[150px]"
                />
              </div>
            )}
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
          <div key={`${queue}-${track}-${plant}`} className="animate-fade-fast flex min-w-0 flex-col gap-6">
            {loading ? (
              <FeedSkeleton />
            ) : grouped.length ? (
              grouped.map((group) => (
                <SectionCard
                  key={group.key}
                  title={group.label}
                  collapsible
                  bodyTone="subtle"
                  bodyClassName="flex flex-col gap-3"
                  meta={
                    <span className="rounded-[var(--radius-sm)] bg-[var(--color-surface-selected)] px-2 py-0.5 text-[12px] font-bold text-brand-700 tabular-nums">
                      {group.items.length}
                    </span>
                  }
                >
                  {group.items.map((decision, index) => (
                    <DecisionItem
                      key={decision.id}
                      decision={decision}
                      expanded={expanded === decision.id}
                      onToggle={() => setExpanded((current) => (current === decision.id ? null : decision.id))}
                      onAct={(target, action) => setActive({ decision: target, action })}
                      style={{ animationDelay: `${Math.min(index, 8) * 15}ms` }}
                    />
                  ))}
                </SectionCard>
              ))
            ) : (
              <Section>
                <EmptyState
                  title="Nothing waiting on you"
                  // description="Every decision in this view has been settled. Adjust the filters to see the wider queue."
                />
              </Section>
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-0 xl:self-start">
            <QueueContext decisions={scoped} records={records} />
          </aside>
        </div>
      </div>

      {active && (
        <DecisionModal
          key={`${active.decision.id}-${active.action}`}
          decision={active.decision}
          action={active.action}
          submitting={submitting}
          onClose={() => {
            if (!submitting) setActive(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
