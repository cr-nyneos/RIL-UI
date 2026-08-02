import { useMemo, useState } from 'react';
import { RotateCcw, Save, Users } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SummaryStrip from '../components/ui/SummaryStrip';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Switch from '../components/ui/Switch';
import TextField from '../components/ui/TextField';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';

import {
  AUTO_UNLOCK_RULES,
  CONTRACT_TYPES,
  DOCUMENT_LIBRARY,
  ESCALATION_RULES,
  NOTIFICATION_TRIGGERS,
  ROLE_NAMES,
  WORKFLOWS,
  WORKFLOW_ROLES,
} from '../lib/mockData/workflow';
import type { Workflow, WorkflowKey, WorkflowRole, WorkflowRules, WorkflowStage } from '../lib/types/workflow';

const WORKFLOW_TABS = [
  { key: 'manufactured', label: 'Manufactured Workflow' },
  { key: 'material', label: 'Material Workflow' },
];

const TITLE_INK = 'text-ink-900';
const FIELD_LABEL = 'text-[14px] leading-5 font-semibold text-ink-700';

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

const ROLE_OPTIONS = toOptions(ROLE_NAMES);
const ESCALATION_OPTIONS = toOptions(ESCALATION_RULES);
const AUTO_UNLOCK_OPTIONS = toOptions(AUTO_UNLOCK_RULES);
const NOTIFICATION_OPTIONS = toOptions(NOTIFICATION_TRIGGERS);
const MANDATORY_OPTIONS = [
  { value: 'mandatory', label: 'Mandatory' },
  { value: 'optional', label: 'Optional' },
];

function formatSla(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24}d SLA`;
  return `${hours}h SLA`;
}

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Record<WorkflowKey, Workflow>>(WORKFLOWS);
  const [activeKey, setActiveKey] = useState<WorkflowKey>('manufactured');
  const [stageId, setStageId] = useState('security-clearance');
  const [dirty, setDirty] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: 'role', dir: 'asc' });

  const workflow = workflows[activeKey];
  const stage = workflow.stages.find((item) => item.id === stageId) ?? workflow.stages[0];

  const patchStage = (patch: Partial<WorkflowStage>) => {
    setDirty(true);
    setWorkflows((current) => ({
      ...current,
      [activeKey]: {
        ...current[activeKey],
        stages: current[activeKey].stages.map((item) => (item.id === stage.id ? { ...item, ...patch } : item)),
      },
    }));
  };

  const patchRules = (patch: Partial<WorkflowRules>) => {
    setDirty(true);
    setWorkflows((current) => ({
      ...current,
      [activeKey]: { ...current[activeKey], rules: { ...current[activeKey].rules, ...patch } },
    }));
  };

  const dependencyOptions = useMemo(
    () => [
      { value: 'none', label: 'No dependency' },
      ...workflow.stages
        .filter((item) => item.id !== stage.id)
        .map((item) => ({ value: item.id, label: item.name })),
    ],
    [workflow.stages, stage.id],
  );

  const roleRows = useMemo(() => {
    const compare = (a: WorkflowRole, b: WorkflowRole) => {
      switch (sort.key) {
        case 'department':
          return a.department.localeCompare(b.department);
        case 'escalation':
          return a.escalationLevel.localeCompare(b.escalationLevel);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return a.role.localeCompare(b.role);
      }
    };
    return [...WORKFLOW_ROLES].sort((a, b) => (sort.dir === 'asc' ? compare(a, b) : -compare(a, b)));
  }, [sort]);

  const roleColumns: Column<WorkflowRole>[] = [
    {
      key: 'role',
      header: 'Role',
      width: '200px',
      sortable: true,
      render: (row) => (
        <span className="truncate text-[15px] leading-6 font-bold text-ink-900" title={row.role}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      width: '170px',
      sortable: true,
      render: (row) => <span className="text-[15px] leading-6 font-semibold text-ink-800">{row.department}</span>,
    },
    {
      key: 'responsibility',
      header: 'Responsibility',
      render: (row) => <span className="text-[15px] leading-6 font-normal text-ink-700">{row.responsibility}</span>,
    },
    {
      key: 'stages',
      header: 'Assigned Workflow Stages',
      width: '230px',
      render: (row) => (
        <span className="text-[15px] leading-6 font-semibold text-ink-800">{row.stages.join(', ')}</span>
      ),
    },
    {
      key: 'escalation',
      header: 'Escalation Level',
      width: '160px',
      align: 'center',
      sortable: true,
      render: (row) => (
        <Badge size="md" tone="neutral">
          {row.escalationLevel}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <AppShell>
      <div className="wfb-type flex flex-col gap-5">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Workflow Builder"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Administration' },
              { label: 'Workflow Builder' },
            ]}
            actions={
              <>
                <Button
                  icon={<RotateCcw size={16} strokeWidth={2.2} />}
                  disabled={!dirty}
                  className="cursor-pointer"
                  onClick={() => {
                    setWorkflows(WORKFLOWS);
                    setDirty(false);
                  }}
                >
                  Discard Changes
                </Button>
                <Button
                  variant="primary"
                  icon={<Save size={16} strokeWidth={2.2} />}
                  disabled={!dirty}
                  className="cursor-pointer"
                  onClick={() => setDirty(false)}
                >
                  Save Workflow
                </Button>
              </>
            }
          />
        </div>

        <div className="glass-raised animate-rise" style={{ animationDelay: '60ms' }}>
          <SummaryStrip
            items={[
              { key: 'total', label: 'Total Workflows', value: Object.keys(workflows).length },
              {
                key: 'active',
                label: 'Active Workflows',
                value: Object.values(workflows).filter((item) => item.status === 'Active').length,
              },
              { key: 'contracts', label: 'Contract Types', value: CONTRACT_TYPES.length },
              { key: 'roles', label: 'Custom Roles', value: WORKFLOW_ROLES.length },
            ]}
          />
        </div>

        <div className="animate-rise flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: '90ms' }}>
          <Tabs
            variant="pill"
            tabs={WORKFLOW_TABS}
            active={activeKey}
            onChange={(key) => {
              setActiveKey(key as WorkflowKey);
              setStageId('security-clearance');
            }}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[14px] leading-5 font-semibold text-ink-700">{workflow.contractType}</span>
            <StatusBadge status={workflow.status} />
          </div>
        </div>

        <SectionCard
          title="Workflow Journey"
          titleClassName={TITLE_INK}
          className="animate-rise"
          style={{ animationDelay: '120ms' }}
          padded={false}
          bodyClassName="px-5 py-6"
          bodyTone="subtle"
        >
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-x-6">
            {workflow.stages.map((item, index) => {
              const selected = item.id === stage.id;

              return (
                <li key={item.id} className="relative flex min-w-0">
                  {index < workflow.stages.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-full hidden w-6 border-t xl:block"
                      style={{ borderColor: 'var(--color-border-strong)' }}
                    />
                  )}

                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStageId(item.id)}
                    className={`focus-bloom flex min-w-0 flex-1 cursor-pointer flex-col gap-2.5 rounded-[var(--radius-md)] border px-4 py-4 text-left transition-colors duration-150 ${
                      selected
                        ? 'border-brand-600 bg-[var(--color-surface-selected)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-section)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[14px] font-bold tabular-nums"
                      style={{
                        background: selected ? 'var(--color-brand-600)' : 'var(--color-brand-soft2)',
                        color: selected ? '#FFFFFF' : 'var(--color-ink-900)',
                      }}
                    >
                      {index + 1}
                    </span>

                    <span className="truncate text-[16px] leading-6 font-bold text-ink-900" title={item.name}>
                      {item.name}
                    </span>

                    <span className="truncate text-[14px] leading-5 font-semibold text-ink-700" title={item.role}>
                      {item.role}
                    </span>

                    <span className="text-[14px] leading-5 font-semibold tabular-nums text-ink-700">
                      {formatSla(item.slaHours)}
                      {!item.mandatory && ' · Optional'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </SectionCard>

        <SectionCard
          title={`Stage Configuration — ${stage.name}`}
          titleClassName={TITLE_INK}
          className="animate-rise"
          style={{ animationDelay: '150ms' }}
          padded={false}
          bodyClassName="px-5 py-6"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Stage Name</span>
              <TextField value={stage.name} onChange={(value) => patchStage({ name: value })} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Assigned Role</span>
              <Select
                ariaLabel="Assigned role"
                value={stage.role}
                options={ROLE_OPTIONS}
                onChange={(value) => patchStage({ role: value })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Dependency</span>
              <Select
                ariaLabel="Dependency stage"
                value={stage.dependency}
                options={dependencyOptions}
                onChange={(value) => patchStage({ dependency: value })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>SLA Duration (hours)</span>
              <TextField
                type="number"
                min={1}
                value={String(stage.slaHours)}
                onChange={(value) => patchStage({ slaHours: Number(value) || 0 })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Escalation Rule</span>
              <Select
                ariaLabel="Escalation rule"
                value={stage.escalation}
                options={ESCALATION_OPTIONS}
                onChange={(value) => patchStage({ escalation: value })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Auto Unlock Rule</span>
              <Select
                ariaLabel="Auto unlock rule"
                value={stage.autoUnlock}
                options={AUTO_UNLOCK_OPTIONS}
                onChange={(value) => patchStage({ autoUnlock: value })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Stage Requirement</span>
              <Select
                ariaLabel="Stage requirement"
                value={stage.mandatory ? 'mandatory' : 'optional'}
                options={MANDATORY_OPTIONS}
                onChange={(value) => patchStage({ mandatory: value === 'mandatory' })}
              />
            </label>
          </div>

          <div className="mt-6">
            <span className={FIELD_LABEL}>Required Documents</span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {DOCUMENT_LIBRARY.map((document) => {
                const active = stage.documents.includes(document);

                return (
                  <button
                    key={document}
                    type="button"
                    aria-pressed={active}
                    className="focus-bloom cursor-pointer rounded-[var(--radius-md)]"
                    onClick={() =>
                      patchStage({
                        documents: active
                          ? stage.documents.filter((item) => item !== document)
                          : [...stage.documents, document],
                      })
                    }
                  >
                    <Badge size="md" tone={active ? 'brand' : 'neutral'} className="px-3 py-1 text-[14px] leading-5">
                      {document}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Role Definitions"
          titleClassName={TITLE_INK}
          className="animate-rise"
          style={{ animationDelay: '180ms' }}
          padded={false}
        >
          <DataTable
            surface={false}
            bordered={false}
            stickyHead={false}
            columns={roleColumns}
            rows={roleRows}
            rowKey={(row) => row.id}
            sort={sort}
            onSortChange={setSort}
            density="compact"
            minWidth="1080px"
            emptyState={
              <EmptyState
                icon={<Users size={22} strokeWidth={2.1} />}
                title="No roles defined"
                description="Add a role to assign it to a workflow stage."
              />
            }
          />
        </SectionCard>

        <SectionCard
          title="Workflow Rules"
          titleClassName={TITLE_INK}
          className="animate-rise"
          style={{ animationDelay: '210ms' }}
          padded={false}
          bodyClassName="px-5 py-6"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            <Switch
              label="Auto progression"
              description="Move an order forward once a stage clears"
              checked={workflow.rules.autoProgression}
              onChange={(checked) => patchRules({ autoProgression: checked })}
            />
            <Switch
              label="Parallel approvals"
              description="Allow independent stages to run together"
              checked={workflow.rules.parallelApprovals}
              onChange={(checked) => patchRules({ parallelApprovals: checked })}
            />
            <Switch
              label="Manual approval required"
              description="Hold every stage for an explicit sign-off"
              checked={workflow.rules.manualApproval}
              onChange={(checked) => patchRules({ manualApproval: checked })}
            />
            <Switch
              label="Escalation enabled"
              description="Apply stage escalation rules on SLA breach"
              checked={workflow.rules.escalationEnabled}
              onChange={(checked) => patchRules({ escalationEnabled: checked })}
            />
            <label className="flex flex-col gap-1.5">
              <span className={FIELD_LABEL}>Notification Trigger</span>
              <Select
                ariaLabel="Notification trigger"
                value={workflow.rules.notification}
                options={NOTIFICATION_OPTIONS}
                onChange={(value) => patchRules({ notification: value })}
              />
            </label>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
