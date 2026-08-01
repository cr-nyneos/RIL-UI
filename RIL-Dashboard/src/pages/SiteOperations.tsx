import { useEffect, useMemo, useState } from 'react';
import { ClipboardPlus, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Section from '../components/ui/Section';
import SectionCard from '../components/ui/SectionCard';
import Select from '../components/ui/Select';
import SummaryStrip from '../components/ui/SummaryStrip';
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
            size="lg"
            rule
            title="Site Operations"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Site Operations', to: '/site-operations' },
              { label: tabs.find((item) => item.key === tab)?.label ?? 'Gate Movements' },
            ]}
            actions={
              <Button
                variant="primary"
                icon={<ClipboardPlus size={16} strokeWidth={2.3} />}
                onClick={() => navigate('/site-operations/new')}
                className="cursor-pointer"
              >
                Record Movement
              </Button>
            }
          />
        </div>

        <Tabs
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
          variant="bar"
          tabs={tabs}
          active={tab}
          onChange={(key) => setTab(key as TabKey)}
        />

        <div
          className="animate-rise flex flex-wrap items-end justify-between gap-4"
          style={{ animationDelay: '90ms' }}
        >
          <div className="flex flex-wrap items-end gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Plant</span>
              <Select value={plant} onChange={setPlant} options={plantOptions} ariaLabel="Plant" className="w-[180px]" />
            </label>
            {tab === 'movements' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-subtitle text-brand-700">Status</span>
                <Select
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  ariaLabel="Movement status"
                  className="w-[190px]"
                />
              </label>
            )}
            <Button
              variant="icon"
              icon={<RefreshCw size={17} strokeWidth={2.3} />}
              aria-label="Refresh site operations"
              title="Refresh site operations"
              onClick={() => setToast('Site operations refreshed.')}
              className="cursor-pointer"
            />
          </div>

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search vehicle, vendor, driver"
            className="w-[280px]"
          />
        </div>

        <SectionCard
          title="Today at a Glance"
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '120ms' }}
        >
          <SummaryStrip
            items={[
              { key: 'onsite', label: 'Vehicles On Site', value: summary.vehiclesOnSite },
              { key: 'entries', label: 'Entries Today', value: summary.entriesToday },
              { key: 'exits', label: 'Exits Today', value: summary.exitsToday },
              { key: 'workforce', label: 'Active Workforce', value: summary.activeWorkforce },
            ]}
          />
        </SectionCard>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
          <div key={tab} className="animate-fade-fast flex min-w-0 flex-col gap-6">
            {tab === 'movements' ? (
              grouped.length ? (
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
                  </SectionCard>
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
