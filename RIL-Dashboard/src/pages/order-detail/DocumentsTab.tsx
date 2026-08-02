import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable, { type Column } from '../../components/ui/DataTable';
import DocumentRow from '../../components/ui/DocumentRow';
import Drawer from '../../components/ui/Drawer';
import KeyValue from '../../components/ui/KeyValue';
import Section from '../../components/ui/Section';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/format';
import type { AttachedDocument, OrderDetail, SecurityPass } from '../../lib/types/orderDetail';

interface DocumentsTabProps {
  detail: OrderDetail;
  onNotify: (message: string) => void;
}

export default function DocumentsTab({ detail, onNotify }: DocumentsTabProps) {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<AttachedDocument | null>(null);

  const columns: Column<SecurityPass>[] = [
    {
      key: 'id',
      header: 'Pass ID',
      width: '110px',
      render: (pass) => <span className="text-body-strong tabular-nums">{pass.id}</span>,
    },
    {
      key: 'holder',
      header: 'Holder',
      render: (pass) => <span className="text-body truncate">{pass.holder}</span>,
    },
    {
      key: 'designation',
      header: 'Designation',
      width: '190px',
      render: (pass) => <span className="text-body truncate">{pass.designation}</span>,
    },
    {
      key: 'validity',
      header: 'Valid From → To',
      width: '210px',
      render: (pass) => (
        <span className="text-body tabular-nums">
          {formatDate(pass.validFrom)} → {formatDate(pass.validTo)}
        </span>
      ),
    },
    {
      key: 'milestone',
      header: 'Linked Milestone',
      width: '190px',
      render: (pass) => <span className="text-body truncate">{pass.milestone}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (pass) => <StatusBadge status={pass.status} size="sm" />,
    },
  ];

  return (
    <>
      <Section
        variant="flush"
        title="Compliance Documents"
        description={`${detail.documents.filter((d) => d.status === 'Verified').length} of ${detail.documents.length} verified.`}
        padded={false}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={15} strokeWidth={2.2} />}
            className="cursor-pointer"
            onClick={() => onNotify('Document upload opens in the compliance workspace.')}
          >
            Upload Document
          </Button>
        }
      >
        {detail.documents.map((document) => (
          <DocumentRow
            key={document.id}
            name={document.name}
            type={document.type}
            status={document.status}
            uploadedBy={document.uploadedBy}
            uploadedAt={document.uploadedAt ? formatDate(document.uploadedAt) : undefined}
            size={document.size}
            onView={() => setPreview(document)}
          />
        ))}
      </Section>

      <Section
        variant="flush"
        title="Security Passes"
        description="Site access held against this order's milestones."
        padded={false}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={15} strokeWidth={2.2} />}
            className="cursor-pointer"
            onClick={() =>
              navigate(`/orders/${detail.orderId}/gates/clearance`, {
                state: { from: `/orders/${detail.orderId}?tab=documents`, fromLabel: 'Order' },
              })
            }
          >
            Request Pass
          </Button>
        }
      >
        <DataTable
          surface={false}
          minWidth="1020px"
          columns={columns}
          rows={detail.securityPasses}
          rowKey={(pass) => pass.id}
        />
      </Section>

      <Drawer
        open={preview !== null}
        title={preview?.name ?? ''}
        description={preview?.type}
        onClose={() => setPreview(null)}
      >
        {preview && (
          <>
            <div className="border-b border-[var(--color-border)] p-5">
              <KeyValue
                columns={2}
                items={[
                  { label: 'Status', value: preview.status },
                  { label: 'File Size', value: preview.size },
                  { label: 'Uploaded By', value: preview.uploadedBy },
                  {
                    label: 'Uploaded On',
                    value: preview.uploadedAt ? formatDate(preview.uploadedAt) : null,
                  },
                ]}
              />
            </div>
            <div className="p-5">
              <div className="glass-inset flex h-64 items-center justify-center">
                <p className="text-meta">Document preview is not available in the POC.</p>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
