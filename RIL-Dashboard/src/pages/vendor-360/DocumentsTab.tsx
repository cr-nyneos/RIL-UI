import { FileText } from 'lucide-react';
import DocumentRow from '../../components/ui/DocumentRow';
import EmptyState from '../../components/ui/EmptyState';
import Section from '../../components/ui/Section';
import type { VendorSnapshot } from '../../lib/vendor360';

interface DocumentsTabProps {
  snapshot: VendorSnapshot;
}

export default function DocumentsTab({ snapshot }: DocumentsTabProps) {
  const { documents } = snapshot;
  const verified = documents.filter((document) => document.status === 'Verified').length;

  return (
    <Section
      variant="flush"
      title="Documents"
      description={`${verified} of ${documents.length} verified across every order for this vendor.`}
      padded={false}
    >
      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} strokeWidth={2.1} />}
          title="No documents on file"
          description="Documents attached to this vendor's orders appear here."
        />
      ) : (
        documents.map((document) => (
          <DocumentRow
            key={`${document.orderId}-${document.id}`}
            name={document.name}
            type={document.type}
            status={document.status}
            uploadedBy={document.orderId}
            uploadedAt={document.uploadedAt}
            size={document.size}
          />
        ))
      )}
    </Section>
  );
}
