import DocumentRow from '../../components/ui/DocumentRow';
import KeyValue from '../../components/ui/KeyValue';
import Section from '../../components/ui/Section';
import { formatDate } from '../../lib/format';
import type { OrderDetail } from '../../lib/types/orderDetail';

interface CompletionFileTabProps {
  detail: OrderDetail;
}

export default function CompletionFileTab({ detail }: CompletionFileTabProps) {
  const artifacts = detail.pcfArtifacts;
  const collected = artifacts.filter((artifact) => artifact.status === 'Collected');
  const lastUpdated = collected
    .map((artifact) => artifact.uploadedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .pop();

  return (
    <div className="p-5">
      <Section title="Project Completion File" padded={false}>
        <div className="border-b border-[var(--color-border)] p-5">
          <KeyValue
            columns={3}
            items={[
              {
                label: 'Status',
                value: collected.length === artifacts.length ? 'Complete' : 'In progress',
              },
              {
                label: 'Artifacts Collected',
                value: `${collected.length} of ${artifacts.length}`,
              },
              { label: 'Last Updated', value: lastUpdated ? formatDate(lastUpdated) : null },
            ]}
          />
        </div>

        {artifacts.map((artifact) => (
          <DocumentRow
            key={artifact.id}
            name={artifact.name}
            type={artifact.type}
            status={artifact.status}
            uploadedBy={artifact.uploadedBy}
            uploadedAt={artifact.uploadedAt ? formatDate(artifact.uploadedAt) : undefined}
          />
        ))}
      </Section>
    </div>
  );
}
