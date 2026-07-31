import { useEffect, useMemo, useState } from 'react';
import { ClipboardPlus, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Section from '../components/ui/Section';
import Select from '../components/ui/Select';
import Tabs from '../components/ui/Tabs';
import Toast from '../components/ui/Toast';

import { MOVEMENT_STATUS_ORDER } from '../lib/mockData/siteOps';
import { ORDER_PLANTS } from '../lib/mockData/orders';
import { useSiteOperations } from '../lib/siteOpsStore';
import type { ManpowerRecord, Movement, MovementStatus } from '../lib/types/siteOps';
import { ManpowerContext, MovementContext } from './site-operations/ContextPanel';
import ManpowerFeed from './site-operations/ManpowerFeed';
import MovementJourney from './site-operations/MovementJourney';

type TabKey = 'movements' | 'manpower';
type StatusFilter = 'all' | MovementStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All movements' },
  ...MOVEMENT_STATUS_ORDER.map((status) => ({ value: status as StatusFilter, label: status })),
];

const GROUPS: { key: string; label: string; statuses: MovementStatus[] }[] = [
  { key: 'attention', label: 'Needs Attention', statuses: ['Blocked', 'Delayed'] },
  { key: 'inside', label: 'Inside The Plant', statuses: ['Awaiting Exit', 'On Site'] },
  { key: 'arriving', label: 'Arriving Later Today', statuses: ['Scheduled'] },
  { key: 'closed', label: 'Closed Today', statuses: ['Exited'] },
];

function matchesMovement(movement: Movement, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    movement.id,
    movement.vehicle,
    movement.vendor,
    movement.orderId,
    movement.driver,
    movement.transporter,
    movement.gate,
    movement.plant,
    movement.zone,
    movement.material,
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function matchesManpower(record: ManpowerRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [record.vendor, record.supervisor, record.zone, record.plant, record.orderId]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function SummaryMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 sm:border-l sm:border-[var(--color-border)] sm:pl-6 sm:first:border-l-0 sm:first:pl-0">
      <div className="text-table-head truncate">{label}</div>
      <div className="mt-1 text-[22px] leading-7 font-bold tracking-[-0.02em] text-ink-900 tabular-nums">{value}</div>
    </div>
  );
}

export default function SiteOperations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movements, manpower, summary } = useSiteOperations();
  const entryState = location.state as { toast?: string; movementId?: string } | null;

  const [tab, setTab] = useState<TabKey>('movements');
  const [query, setQuery] = useState('');
  const [plant, setPlant] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [expandedMovement, setExpandedMovement] = useState<string | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(entryState?.toast ?? null);
  const [highlightId, setHighlightId] = useState<string | null>(entryState?.movementId ?? null);

  // The newly recorded movement settles after a moment, matching every other listing.
  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = window.setTimeout(() => setHighlightId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const plantOptions = useMemo(
    () => [{ value: 'all', label: 'All plants' }, ...ORDER_PLANTS.map((value) => ({ value, label: value }))],
    [],
  );

  const filteredMovements = useMemo(
    () =>
      movements.filter((movement) => {
        if (!matchesMovement(movement, query)) return false;
        if (plant !== 'all' && movement.plant !== plant) return false;
        if (status !== 'all' && movement.status !== status) return false;
        return true;
      }),
    [movements, plant, query, status],
  );

  const filteredManpower = useMemo(
    () =>
      manpower.filter((record) => {
        if (!matchesManpower(record, query)) return false;
        if (plant !== 'all' && record.plant !== plant) return false;
        return true;
      }),
    [manpower, plant, query],
  );

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: filteredMovements
          .filter((movement) => group.statuses.includes(movement.status))
          .sort(
            (a, b) =>
              MOVEMENT_STATUS_ORDER.indexOf(a.status) - MOVEMENT_STATUS_ORDER.indexOf(b.status) ||
              a.vehicle.localeCompare(b.vehicle),
          ),
      })).filter((group) => group.items.length > 0),
    [filteredMovements],
  );

  const tabs = [
    { key: 'movements', label: 'Gate Movements', count: filteredMovements.length },
    { key: 'manpower', label: 'Manpower', count: filteredManpower.length },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            title="Site Operations"
            actions={
              <>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search vehicle, vendor, driver"
                  className="w-full sm:w-[260px]"
                />
                <Button
                  variant="secondary"
                  icon={<RefreshCw size={16} strokeWidth={2.3} />}
                  aria-label="Refresh site operations"
                  onClick={() => setToast('Site operations refreshed.')}
                  className="cursor-pointer"
                />
                <Button
                  variant="primary"
                  icon={<ClipboardPlus size={16} strokeWidth={2.3} />}
                  onClick={() => navigate('/site-operations/new')}
                  className="cursor-pointer"
                >
                  Record Movement
                </Button>
              </>
            }
          />
          <p className="text-meta mt-1">
            Live vehicle, material and manpower movement across every plant gate.
          </p>
        </div>

        <Section
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
          toolbar={
            <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <SummaryMetric label="Vehicles On Site" value={summary.vehiclesOnSite} />
              <SummaryMetric label="Entries Today" value={summary.entriesToday} />
              <SummaryMetric label="Exits Today" value={summary.exitsToday} />
              <SummaryMetric label="Active Workforce" value={summary.activeWorkforce} />
            </div>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as TabKey)} />
            <div className="flex flex-wrap items-center gap-2">
              <Select value={plant} onChange={setPlant} options={plantOptions} ariaLabel="Plant" className="min-w-[150px]" />
              {tab === 'movements' && (
                <Select
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  ariaLabel="Movement status"
                  className="min-w-[170px]"
                />
              )}
            </div>
          </div>
        </Section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
          <div key={tab} className="animate-fade-fast flex min-w-0 flex-col gap-6">
            {tab === 'movements' ? (
              grouped.length ? (
                grouped.map((group) => (
                  <section key={group.key} className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-2 px-1">
                      <h2 className="text-table-head">{group.label}</h2>
                      <span className="text-meta tabular-nums">{group.items.length}</span>
                    </div>
                    {group.items.map((movement, index) => (
                      <MovementJourney
                        key={movement.id}
                        movement={movement}
                        expanded={expandedMovement === movement.id}
                        onToggle={() =>
                          setExpandedMovement((current) => (current === movement.id ? null : movement.id))
                        }
                        highlight={highlightId === movement.id}
                        style={{ animationDelay: `${Math.min(index, 8) * 15}ms` }}
                      />
                    ))}
                  </section>
                ))
              ) : (
                <Section>
                  <EmptyState
                    title="No movements found"
                    description="Adjust the search or filters to view gate activity."
                  />
                </Section>
              )
            ) : (
              <ManpowerFeed
                records={filteredManpower}
                expandedId={expandedVendor}
                onToggle={(id) => setExpandedVendor((current) => (current === id ? null : id))}
              />
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-0 xl:self-start">
            {tab === 'movements' ? (
              <MovementContext movements={filteredMovements} averageDwellMinutes={summary.averageDwellMinutes} />
            ) : (
              <ManpowerContext records={filteredManpower} />
            )}
          </aside>
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
