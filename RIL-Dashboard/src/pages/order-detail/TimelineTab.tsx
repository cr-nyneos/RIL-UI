import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import DocumentRow from '../../components/ui/DocumentRow';
import KeyValue from '../../components/ui/KeyValue';
import Timeline, { type TimelineNodeData } from '../../components/ui/Timeline';
import { formatDate } from '../../lib/format';
import type { Milestone, OrderDetail } from '../../lib/types/orderDetail';

const STATE_LABEL: Record<Milestone['state'], string> = {
  complete: 'Complete',
  current: 'In progress',
  locked: 'Locked',
  blocked: 'Blocked',
};

interface TimelineTabProps {
  detail: OrderDetail;
  orderId: string;
}

export default function TimelineTab({ detail, orderId }: TimelineTabProps) {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = detail.milestones.find((milestone) => milestone.key === openKey) ?? null;

  const nodes: TimelineNodeData[] = detail.milestones.map((milestone) => ({
    key: milestone.key,
    label: milestone.label,
    state: milestone.state,
    owner: milestone.owner,
    timestamp: milestone.timestamp ? formatDate(milestone.timestamp) : undefined,
    dependencies: milestone.dependencies,
    detail: milestone.detail,
  }));

  return (
    <>
      <div className="p-5">
        <Timeline
          nodes={nodes}
          renderAction={(node) => (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => navigate(`/orders/${orderId}/gates/${node.key}`)}
            >
              Details
            </Button>
          )}
        />
      </div>

      <Drawer
        open={open !== null}
        title={open?.label ?? ''}
        description={open ? STATE_LABEL[open.state] : undefined}
        onClose={() => setOpenKey(null)}
      >
        {open && (
          <>
            <div className="border-b border-[var(--color-border)] p-5">
              <KeyValue
                columns={2}
                items={[
                  { label: 'Owner', value: open.owner?.name },
                  { label: 'Role', value: open.owner?.role },
                  { label: 'State', value: STATE_LABEL[open.state] },
                  { label: 'Recorded', value: open.timestamp ? formatDate(open.timestamp) : null },
                  { label: 'Note', value: open.detail, span: 2 },
                ]}
              />
            </div>

            <section className="border-b border-[var(--color-border)]">
              <h3 className="text-table-head surface-toolbar px-5 py-2">Owner History</h3>
              {(open.history ?? []).map((entry) => (
                <div
                  key={`${entry.at}-${entry.note}`}
                  className="flex items-start gap-3 border-b border-[var(--color-glass-hairline)] px-5 py-3 last:border-b-0"
                >
                  <span className="text-meta w-24 flex-none tabular-nums">{formatDate(entry.at)}</span>
                  <p className="text-body min-w-0">{entry.note}</p>
                </div>
              ))}
              {(open.history ?? []).length === 0 && (
                <p className="text-meta px-5 py-3">No owner history recorded yet.</p>
              )}
            </section>

            <section>
              <h3 className="text-table-head surface-toolbar px-5 py-2">Linked Documents</h3>
              {(open.documents ?? []).map((name) => (
                <DocumentRow key={name} name={name} type="Milestone Record" status="Verified" />
              ))}
              {(open.documents ?? []).length === 0 && (
                <p className="text-meta px-5 py-3">No documents linked to this gate yet.</p>
              )}
            </section>
          </>
        )}
      </Drawer>
    </>
  );
}
