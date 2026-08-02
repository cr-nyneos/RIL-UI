import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import DataTable, { type Column } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/format';
import type { VendorCertificationStatus, VendorSnapshot } from '../../lib/vendor360';

interface ComplianceTabProps {
  snapshot: VendorSnapshot;
}

function expiryLabel(certification: VendorCertificationStatus): string {
  if (certification.daysLeft < 0) return `${Math.abs(certification.daysLeft)} days ago`;
  if (certification.daysLeft === 0) return 'Expires today';
  return `in ${certification.daysLeft} days`;
}

export default function ComplianceTab({ snapshot }: ComplianceTabProps) {
  const { vendor, profile, certifications } = snapshot;
  const alerts = certifications.filter((certification) => certification.status !== 'Valid');

  const columns: Column<VendorCertificationStatus>[] = [
    {
      key: 'name',
      header: 'Certification',
      render: (certification) => <span className="text-body-strong truncate">{certification.name}</span>,
    },
    {
      key: 'authority',
      header: 'Issuing Authority',
      width: '220px',
      render: (certification) => <span className="text-body truncate">{certification.authority}</span>,
    },
    {
      key: 'validTo',
      header: 'Valid Until',
      width: '180px',
      render: (certification) => (
        <span className="text-body tabular-nums">{formatDate(certification.validTo)}</span>
      ),
    },
    {
      key: 'expiry',
      header: 'Expiry',
      width: '160px',
      render: (certification) => <span className="text-meta tabular-nums">{expiryLabel(certification)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (certification) => <StatusBadge status={certification.status} size="sm" />,
    },
  ];

  return (
    <>
      <Section
        variant="flush"
        title="KYC & Compliance"
        description="Registration record verified during onboarding."
      >
        {alerts.length > 0 && (
          <div className="mb-5">
            <Alert
              tone={alerts.some((certification) => certification.status === 'Expired') ? 'danger' : 'warning'}
              icon={<AlertTriangle size={15} strokeWidth={2.2} />}
            >
              {alerts.map((certification) => certification.name).join(', ')} — renew before the next award.
            </Alert>
          </div>
        )}

        <KeyValue
          columns={4}
          items={[
            { label: 'KYC Status', value: vendor.complianceState },
            { label: 'Last Verified', value: profile.kycVerifiedAt ? formatDate(profile.kycVerifiedAt) : null },
            { label: 'Risk Rating', value: vendor.risk },
            { label: 'MSME Registered', value: profile.msme ? 'Yes' : 'No' },
          ]}
        />

        <div className="mt-5 border-t border-[var(--color-border)] pt-4">
          <div className="text-meta">Compliance Score</div>
          <div className="mt-2 max-w-[420px]">
            <ProgressMeter
              value={vendor.compliance}
              showLabel
              tone={vendor.compliance < 70 ? 'danger' : 'neutral'}
              delay={80}
            />
          </div>
        </div>
      </Section>

      <Section variant="flush" title="Certifications" padded={false}>
        <DataTable
          surface={false}
          minWidth="900px"
          columns={columns}
          rows={certifications}
          rowKey={(certification) => certification.name}
          emptyState={
            <EmptyState
              icon={<ShieldCheck size={22} strokeWidth={2.1} />}
              title="No certifications recorded"
              description="Certifications collected during onboarding appear here."
            />
          }
        />
      </Section>
    </>
  );
}
