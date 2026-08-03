import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle2, Plus, Save, Send } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import StatusBadge from '../components/ui/StatusBadge';
import { StageNode, TerminalNode, type StageNodeData, type TerminalNodeData } from './workflow-builder/StageNode';
import StageDrawer from './workflow-builder/StageDrawer';
import InsertEdge from './workflow-builder/InsertEdge';
import InsertStageModal, { type InsertPayload } from './workflow-builder/InsertStageModal';

import { useNotifications } from '../lib/notifications/NotificationsContext';
import { NOTIFICATION_TRIGGERS, STAGE_LIBRARY, WORKFLOWS } from '../lib/mockData/workflow';
import type { Option } from '../lib/types/ui';
import type { Workflow, WorkflowKey, WorkflowStage } from '../lib/types/workflow';

type FlowNode = Node<StageNodeData> | Node<TerminalNodeData>;

const START_ID = '__start';
const FINISH_ID = '__finish';

const NODE_TYPES = { stage: StageNode, terminal: TerminalNode };
const EDGE_TYPES = { insert: InsertEdge };

/** Horizontal chain: Start → stages → Finish, laid out left to right. */
const STAGE_WIDTH = 320;
const TERMINAL_WIDTH = 150;
const STAGE_GAP = 90;
const FIRST_STAGE_X = TERMINAL_WIDTH + STAGE_GAP;
/** Terminal pills are shorter than stage cards, so nudge them onto the same centre line. */
const TERMINAL_Y = 16;

const WORKFLOW_OPTIONS: Option<WorkflowKey>[] = [
  { value: 'manufactured', label: 'Manufactured' },
  { value: 'material', label: 'Material' },
];

const EDGE_STYLE = { stroke: 'var(--color-border-strong)', strokeWidth: 2 };
const EDGE_MARKER = { type: MarkerType.ArrowClosed, color: 'var(--color-border-strong)', width: 18, height: 18 };

function formatDuration(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24}d`;
  return `${hours}h`;
}

function layoutFor(stages: WorkflowStage[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {
    [START_ID]: { x: 0, y: TERMINAL_Y },
  };
  stages.forEach((stage, index) => {
    positions[stage.id] = { x: FIRST_STAGE_X + index * (STAGE_WIDTH + STAGE_GAP), y: 0 };
  });
  positions[FINISH_ID] = {
    x: FIRST_STAGE_X + stages.length * (STAGE_WIDTH + STAGE_GAP),
    y: TERMINAL_Y,
  };
  return positions;
}

/** The chain is strictly linear, so every stage depends on the one before it. */
function relink(stages: WorkflowStage[]): WorkflowStage[] {
  return stages.map((stage, index) => ({
    ...stage,
    dependency: index === 0 ? 'none' : stages[index - 1].id,
  }));
}

function uniqueId(base: string, taken: WorkflowStage[]): string {
  if (!taken.some((stage) => stage.id === base)) return base;
  let suffix = 2;
  while (taken.some((stage) => stage.id === `${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function buildNodes(
  stages: WorkflowStage[],
  selectedId: string | null,
  previous?: Map<string, FlowNode>,
): FlowNode[] {
  const layout = layoutFor(stages);

  const startNode: Node<TerminalNodeData> = {
    ...(previous?.get(START_ID) as Node<TerminalNodeData> | undefined),
    id: START_ID,
    type: 'terminal',
    position: layout[START_ID],
    data: { label: 'Start', kind: 'start' },
    draggable: false,
    selectable: false,
  };

  const stageNodes: Node<StageNodeData>[] = stages.map((stage) => ({
    ...(previous?.get(stage.id) as Node<StageNodeData> | undefined),
    id: stage.id,
    type: 'stage',
    position: layout[stage.id],
    selected: stage.id === selectedId,
    data: {
      name: stage.name,
      role: stage.role,
      duration: formatDuration(stage.slaHours),
      stageId: stage.id,
      optional: !stage.mandatory,
      disabled: stage.enabled === false,
    },
  }));

  const finishNode: Node<TerminalNodeData> = {
    ...(previous?.get(FINISH_ID) as Node<TerminalNodeData> | undefined),
    id: FINISH_ID,
    type: 'terminal',
    position: layout[FINISH_ID],
    data: { label: 'Finish', kind: 'finish' },
    draggable: false,
    selectable: false,
  };

  return [startNode, ...stageNodes, finishNode];
}

export default function WorkflowBuilder() {
  const { notify } = useNotifications();
  const [workflows, setWorkflows] = useState<Record<WorkflowKey, Workflow>>(WORKFLOWS);
  const [activeKey, setActiveKey] = useState<WorkflowKey>('manufactured');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(() => buildNodes(WORKFLOWS.manufactured.stages, null));
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const workflow = workflows[activeKey];
  const stages = workflow.stages;
  const selectedStage = stages.find((item) => item.id === selectedId) ?? null;

  /** Single write path: relink the chain, re-lay the canvas, move the selection. */
  const commitStages = useCallback(
    (next: WorkflowStage[], nextSelectedId: string | null) => {
      const linked = relink(next);
      setWorkflows((current) => ({
        ...current,
        [activeKey]: { ...current[activeKey], stages: linked },
      }));
      setNodes((current) =>
        buildNodes(linked, nextSelectedId, new Map(current.map((node) => [node.id, node]))),
      );
      setSelectedId(nextSelectedId);
    },
    [activeKey],
  );

  const openInsert = useCallback((index: number) => setInsertAt(index), []);

  const edges = useMemo<Edge[]>(() => {
    const chain = [START_ID, ...stages.map((stage) => stage.id), FINISH_ID];

    return chain.slice(0, -1).map((source, index) => ({
      id: `${source}-${chain[index + 1]}`,
      source,
      target: chain[index + 1],
      type: 'insert',
      data: { index, onInsert: openInsert },
      style: EDGE_STYLE,
      markerEnd: EDGE_MARKER,
    }));
  }, [stages, openInsert]);

  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  /** Dragging a card left or right reorders the chain; the canvas then re-snaps. */
  const onNodeDragStop = useCallback(() => {
    const reordered = nodes
      .filter((node) => node.id !== START_ID && node.id !== FINISH_ID)
      .slice()
      .sort((a, b) => a.position.x - b.position.x)
      .map((node) => stages.find((stage) => stage.id === node.id))
      .filter((stage): stage is WorkflowStage => Boolean(stage));

    if (reordered.some((stage, index) => stage.id !== stages[index]?.id)) {
      commitStages(reordered, selectedId);
      return;
    }

    setNodes((current) => buildNodes(stages, selectedId, new Map(current.map((node) => [node.id, node]))));
  }, [nodes, stages, selectedId, commitStages]);

  const insertStage = (payload: InsertPayload) => {
    if (insertAt === null) return;
    const id = uniqueId(payload.libraryId ?? 'custom-stage', stages);
    const preset = STAGE_LIBRARY.find((item) => item.id === payload.libraryId);
    const stage: WorkflowStage = {
      id,
      name: payload.name,
      role: payload.role,
      dependency: 'none',
      slaHours: payload.slaHours,
      escalation: preset?.escalation ?? 'No escalation',
      documents: preset ? [...preset.documents] : [],
      autoUnlock: 'On previous stage completion',
      mandatory: true,
      notification: NOTIFICATION_TRIGGERS[0],
      enabled: true,
    };

    const next = [...stages];
    next.splice(insertAt, 0, stage);
    commitStages(next, id);
    setInsertAt(null);
  };

  const deleteStage = () => {
    if (!selectedStage) return;
    commitStages(
      stages.filter((item) => item.id !== selectedStage.id),
      null,
    );
  };

  const validate = () => {
    const issues: string[] = [];
    if (stages.length === 0) issues.push('the workflow has no stages');
    stages.forEach((stage) => {
      if (!stage.name.trim()) issues.push('a stage is missing a name');
      if (!stage.role) issues.push(`${stage.name} has no assigned role`);
      if (stage.slaHours <= 0) issues.push(`${stage.name} has no duration`);
    });

    notify({
      title: issues.length === 0 ? 'Workflow is valid' : 'Workflow has issues',
      description:
        issues.length === 0
          ? `${stages.length} stages checked with no issues`
          : issues.slice(0, 3).join(', '),
      module: 'Execution',
      to: '/workflow-builder',
    });
  };

  const saveDraft = () => {
    setWorkflows((current) => ({
      ...current,
      [activeKey]: { ...current[activeKey], status: 'Draft' },
    }));
    notify({
      title: 'Draft saved',
      description: `${workflow.label} saved with ${stages.length} stages`,
      module: 'Execution',
      to: '/workflow-builder',
    });
  };

  const publish = () => {
    setWorkflows((current) => ({
      ...current,
      [activeKey]: { ...current[activeKey], status: 'Active' },
    }));
    notify({
      title: 'Workflow published',
      description: `${workflow.label} is now live for new orders`,
      module: 'Execution',
      to: '/workflow-builder',
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
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
                <Button icon={<Save size={16} strokeWidth={2.2} />} className="cursor-pointer" onClick={saveDraft}>
                  Save Draft
                </Button>
                {/* <Button
                  icon={<Download size={16} strokeWidth={2.2} />}
                  className="cursor-pointer"
                  onClick={exportWorkflow}
                >
                  Export
                </Button> */}
                <Button
                  variant="primary"
                  icon={<Send size={16} strokeWidth={2.2} />}
                  className="cursor-pointer"
                  onClick={publish}
                >
                  Publish
                </Button>
              </>
            }
          />
        </div>

        <div
          className="animate-rise flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-toolbar)] px-4 py-3"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[14px] leading-5 font-semibold text-ink-700">Workflow Type</span>
            <Select
              ariaLabel="Workflow type"
              value={activeKey}
              options={WORKFLOW_OPTIONS}
              className="min-w-[180px]"
              onChange={(value) => {
                setActiveKey(value);
                setSelectedId(null);
                setNodes(() => buildNodes(workflows[value].stages, null));
              }}
            />
            <StatusBadge status={workflow.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              icon={<Plus size={16} strokeWidth={2.2} />}
              className="cursor-pointer"
              onClick={() => openInsert(stages.length)}
            >
              Add Stage
            </Button>
            <Button
              icon={<CheckCircle2 size={16} strokeWidth={2.2} />}
              className="cursor-pointer"
              onClick={validate}
            >
              Validate
            </Button>
          </div>
        </div>

        <div
          className="animate-rise h-[calc(100vh-330px)] max-h-[520px] min-h-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)]"
          style={{ animationDelay: '90ms' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={(_, node) => {
              if (node.id !== START_ID && node.id !== FINISH_ID) setSelectedId(node.id);
            }}
            onPaneClick={() => setSelectedId(null)}
            nodesConnectable={false}
            edgesFocusable={false}
            fitView
            fitViewOptions={{ padding: 0.12, minZoom: 0.6, maxZoom: 1 }}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.6} color="var(--color-border-strong)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      <StageDrawer
        open={Boolean(selectedStage)}
        stage={selectedStage}
        onClose={() => setSelectedId(null)}
        onDelete={deleteStage}
        onChange={(patch) =>
          commitStages(
            stages.map((item) => (item.id === selectedStage?.id ? { ...item, ...patch } : item)),
            selectedId,
          )
        }
      />

      <InsertStageModal
        open={insertAt !== null}
        position={insertAt ?? 0}
        onClose={() => setInsertAt(null)}
        onInsert={insertStage}
      />
    </AppShell>
  );
}
