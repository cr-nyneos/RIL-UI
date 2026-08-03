import { AlertTriangle } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import { formatCurrency, formatDate } from '../../lib/format';
import { formatDuration } from '../../lib/siteOpsStore';
import type { VendorSnapshot } from '../../lib/vendor360';

interface OverviewTabProps {
  snapshot: VendorSnapshot;
}

export default function OverviewTab({ snapshot }: OverviewTabProps) {
  const { vendor, health, certifications } = snapshot;
  const expiring = certifications.filter((certification) => certification.status !== 'Valid');
  const hasAlerts = snapshot.breachedApprovals > 0 || expiring.length > 0;

  return (
    <>
      <Section variant="flush" title="Standing">
        {hasAlerts && (
          <div className="mb-5 flex flex-col gap-2">
            {snapshot.breachedApprovals > 0 && (
              <Alert tone="danger" icon={<AlertTriangle size={15} strokeWidth={2.2} />}>
                {snapshot.breachedApprovals} approval{snapshot.breachedApprovals > 1 ? 's have' : ' has'} breached its
                decision window.
              </Alert>
            )}
            {expiring.length > 0 && (
              <Alert tone="warning" icon={<AlertTriangle size={15} strokeWidth={2.2} />}>
                {expiring.length} certification{expiring.length > 1 ? 's need' : ' needs'} renewal — earliest is{' '}
                {expiring[0].name} on {formatDate(expiring[0].validTo)}.
              </Alert>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[17px] leading-6 font-semibold text-[var(--color-ink-900)]">Health Score</span>
              <span className="text-[17px] leading-6 font-semibold tabular-nums text-[var(--color-ink-900)]">
                {health}%
              </span>
            </div>
            <div className="mt-2">
              <ProgressMeter value={health} tone={health < 70 ? 'danger' : 'neutral'} delay={80} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[17px] leading-6 font-semibold text-[var(--color-ink-900)]">Compliance</span>
              <span className="text-[17px] leading-6 font-semibold tabular-nums text-[var(--color-ink-900)]">
                {vendor.compliance}%
              </span>
            </div>
            <div className="mt-2">
              <ProgressMeter
                value={vendor.compliance}
                tone={vendor.compliance < 70 ? 'danger' : 'neutral'}
                delay={120}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section variant="flush" title="Current Position">
        <KeyValue
          columns={4}
          size="lg"
          items={[
            { label: 'Active Orders', value: snapshot.activeOrders.length },
            { label: 'Open Approvals', value: snapshot.approvals.length },
            { label: 'Vehicles On Site', value: snapshot.onSite.length },
            { label: 'Workforce On Site', value: snapshot.workforce },
            { label: 'Delayed Orders', value: snapshot.delayedOrders.length },
            { label: 'Order Value', value: formatCurrency(snapshot.orderValueCr) },
            { label: 'Average Dwell', value: formatDuration(snapshot.averageDwellMinutes) },
            { label: 'Last Activity', value: formatDate(vendor.lastActivity) },
          ]}
        />
      </Section>
    </>
  );
}
