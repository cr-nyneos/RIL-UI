import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable, { type Column } from '../../components/ui/DataTable';
import KeyValue from '../../components/ui/KeyValue';
import Modal from '../../components/ui/Modal';
import SearchInput from '../../components/ui/SearchInput';
import TextField from '../../components/ui/TextField';
import { eligibleOwners } from '../../lib/mockData/orderDetail';
import { reassignStakeholder } from '../../lib/orderDetailStore';
import type { OrderDetail, StakeholderAssignment } from '../../lib/types/orderDetail';

interface StakeholdersTabProps {
  orderId: string;
  detail: OrderDetail;
  onNotify: (message: string) => void;
}

export default function StakeholdersTab({ orderId, detail, onNotify }: StakeholdersTabProps) {
  const [target, setTarget] = useState<StakeholderAssignment | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const candidates = useMemo(() => {
    if (!target) return [];
    const q = query.trim().toLowerCase();
    return eligibleOwners(target.role)
      .filter((candidate) => candidate.name !== target.owner)
      .filter((candidate) => !q || candidate.name.toLowerCase().includes(q));
  }, [target, query]);

  const close = () => {
    setTarget(null);
    setQuery('');
    setSelected(null);
    setReason('');
  };

  const confirm = () => {
    if (!target || !selected || !reason.trim()) return;
    reassignStakeholder({
      orderId,
      gateKey: target.gateKey,
      owner: selected,
      actor: 'Site Administrator',
      reason: reason.trim(),
    });
    onNotify(`${target.gate} reassigned to ${selected}.`);
    close();
  };

  const columns: Column<StakeholderAssignment>[] = [
    {
      key: 'gate',
      header: 'Gate',
      width: '210px',
      render: (row) => <span className="text-body-strong truncate">{row.gate}</span>,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (row) => <span className="text-body truncate">{row.owner}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      width: '180px',
      render: (row) => <span className="text-body truncate">{row.role}</span>,
    },
    {
      key: 'plant',
      header: 'Plant',
      width: '130px',
      render: (row) => <span className="text-body">{row.plant}</span>,
    },
    {
      key: 'assignment',
      header: 'Assignment',
      width: '130px',
      render: (row) => (
        <Badge tone={row.assignment === 'Manual' ? 'brand' : 'neutral'} shape="square" size="sm">
          {row.assignment}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      width: '120px',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            setTarget(row);
            setSelected(null);
            setQuery('');
            setReason('');
          }}
        >
          Reassign
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        surface={false}
        minWidth="1020px"
        columns={columns}
        rows={detail.stakeholders}
        rowKey={(row) => row.gateKey}
        bodyKey={detail.stakeholders.map((row) => `${row.gateKey}:${row.owner}`).join('|')}
      />

      <Modal
        open={target !== null}
        title="Reassign Gate Owner"
        description={target?.gate}
        onClose={close}
        footer={
          <>
            <Button variant="secondary" className="cursor-pointer" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="cursor-pointer"
              disabled={!selected || !reason.trim()}
              onClick={confirm}
            >
              Reassign Owner
            </Button>
          </>
        }
      >
        {target && (
          <div className="flex flex-col gap-5">
            <div className="glass-inset p-4">
              <KeyValue
                columns={2}
                items={[
                  { label: 'Current Owner', value: target.owner },
                  { label: 'Role', value: target.role },
                ]}
              />
            </div>

            <div>
              <label className="text-meta mb-1.5 block" htmlFor="reassign-search">
                Eligible Owners
              </label>
              <SearchInput
                id="reassign-search"
                value={query}
                onChange={setQuery}
                placeholder={`Search ${target.role}s`}
                className="w-full"
              />

              <div className="glass-inset mt-2.5 max-h-56 overflow-y-auto">
                {candidates.map((candidate, index) => {
                  const active = selected === candidate.name;
                  return (
                    <button
                      key={candidate.name}
                      type="button"
                      onClick={() => setSelected(candidate.name)}
                      aria-pressed={active}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-[var(--color-surface-section)] ${
                        index > 0 ? 'border-t border-[var(--color-border)]' : ''
                      }`}
                      style={active ? { background: 'var(--wash-brand-active)' } : undefined}
                    >
                      <span className="min-w-0">
                        <span className="text-body-strong block truncate">{candidate.name}</span>
                        <span className="text-meta block truncate">
                          {target.role} · {candidate.plant}
                        </span>
                      </span>
                      {active && <Check size={15} strokeWidth={2.8} className="flex-none text-brand-700" />}
                    </button>
                  );
                })}
                {candidates.length === 0 && (
                  <p className="text-meta px-3.5 py-3">No eligible owner matches that search.</p>
                )}
              </div>
            </div>

            <TextField
              id="reassign-reason"
              label="Reason"
              value={reason}
              onChange={setReason}
              placeholder="Why is this gate being reassigned?"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
