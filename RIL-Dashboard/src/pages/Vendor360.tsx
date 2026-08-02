import { useMemo } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import KeyValue from '../components/ui/KeyValue';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import StatusBadge from '../components/ui/StatusBadge';
import Tabs, { type TabItem } from '../components/ui/Tabs';

import ActivityTab from './vendor-360/ActivityTab';
import ComplianceTab from './vendor-360/ComplianceTab';
import DocumentsTab from './vendor-360/DocumentsTab';
import FinancialsTab from './vendor-360/FinancialsTab';
import OperationsTab from './vendor-360/OperationsTab';
import OrdersTab from './vendor-360/OrdersTab';
import OverviewTab from './vendor-360/OverviewTab';

import { formatDate } from '../lib/format';
import { useVendor360, type VendorSnapshot } from '../lib/vendor360';
import type { VendorRisk } from '../lib/types/vendor';

type VendorTab =
  | 'overview'
  | 'orders'
  | 'documents'
  | 'operations'
  | 'financials'
  | 'compliance'
  | 'activity';

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'documents', label: 'Documents' },
  { key: 'operations', label: 'Operations' },
  { key: 'financials', label: 'Financials' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'activity', label: 'Activity' },
];

const VALID_TABS = new Set(TABS.map((tab) => tab.key));

const RISK_TONE: Record<VendorRisk, 'neutral' | 'warning' | 'danger'> = {
  Low: 'neutral',
  Medium: 'warning',
  High: 'danger',
};

function renderTab(tab: VendorTab, snapshot: VendorSnapshot) {
  switch (tab) {
    case 'orders':
      return <OrdersTab snapshot={snapshot} />;
    case 'documents':
      return <DocumentsTab snapshot={snapshot} />;
    case 'operations':
      return <OperationsTab snapshot={snapshot} />;
    case 'financials':
      return <FinancialsTab snapshot={snapshot} />;
    case 'compliance':
      return <ComplianceTab snapshot={snapshot} />;
    case 'activity':
      return <ActivityTab snapshot={snapshot} />;
    case 'overview':
    default:
      return <OverviewTab snapshot={snapshot} />;
  }
}

export default function Vendor360() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const snapshot = useVendor360(id);

  const activeTab = useMemo<VendorTab>(() => {
    const requested = searchParams.get('tab') ?? 'overview';
    return VALID_TABS.has(requested) ? (requested as VendorTab) : 'overview';
  }, [searchParams]);

  const kpiGroups: KpiGroup[] = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        header: 'Total Orders',
        data: [
          { title: 'Active', value: snapshot.activeOrders.length },
          { title: 'Completed', value: snapshot.completedOrders.length },
        ],
      },
      {
        header: 'Total Approvals',
        data: [
          { title: 'Open', value: snapshot.approvals.length },
          { title: 'Breached', value: snapshot.breachedApprovals },
        ],
      },
      {
        header: 'Total Site Presence',
        data: [
          { title: 'Vehicles On Site', value: snapshot.onSite.length },
          { title: 'Workforce', value: snapshot.workforce },
        ],
      },
      {
        header: 'Total Standing',
        data: [
          { title: 'Health Score', value: snapshot.health },
          { title: 'Compliance', value: snapshot.vendor.compliance },
        ],
      },
    ];
  }, [snapshot]);

  if (!snapshot) {
    return (
      <AppShell>
        <Section title="Vendor 360">
          <EmptyState
            icon={<Building2 size={22} strokeWidth={2.1} />}
            title="Vendor not found"
            description="Return to the vendor directory and choose a vendor."
          />
        </Section>
      </AppShell>
    );
  }

  const { vendor, profile } = snapshot;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title={vendor.name}
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Vendors', to: '/vendors' },
              { label: vendor.name },
            ]}
            actions={
              <Button
                variant="secondary"
                icon={<ArrowLeft size={16} strokeWidth={2.2} />}
                className="cursor-pointer"
                onClick={() => navigate('/vendors')}
              >
                Back to Directory
              </Button>
            }
          />
        </div>

        {/* KPI CARDS — the directory's cards verbatim; `.tsy` carries the palette. */}
        <div
          className="tsy animate-rise grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
          style={{ animationDelay: '60ms' }}
        >
          {kpiGroups.map((group) => (
            <KpiGroupCard key={group.header} group={group} />
          ))}
        </div>

        <div className="animate-rise" style={{ animationDelay: '90ms' }}>
          <Section
            title="Vendor Overview"
            actions={
              <>
                <StatusBadge status={vendor.status} />
                <Badge tone={RISK_TONE[vendor.risk]}>{vendor.risk} Risk</Badge>
              </>
            }
          >
            <KeyValue
              columns={4}
              items={[
                { label: 'Vendor Code', value: vendor.code },
                { label: 'Category', value: vendor.category },
                { label: 'Primary Contact', value: `${profile.contactName} · ${profile.contactRole}` },
                { label: 'Contact', value: `${profile.phone} · ${profile.email}` },
                { label: 'Plant Presence', value: vendor.plants.join(', ') },
                { label: 'Registered Office', value: profile.city },
                { label: 'GSTIN', value: profile.gstin },
                { label: 'Onboarded', value: formatDate(profile.onboardedAt) },
              ]}
            />
          </Section>
        </div>

        <section className="surface-section animate-rise overflow-hidden" style={{ animationDelay: '120ms' }}>
          <header className="surface-section-head" aria-label="Vendor 360 tabs">
            <Tabs
              tabs={TABS}
              active={activeTab}
              onChange={(key) => setSearchParams({ tab: key })}
              variant="attached"
            />
          </header>
          <div>{renderTab(activeTab, snapshot)}</div>
        </section>
      </div>
    </AppShell>
  );
}
