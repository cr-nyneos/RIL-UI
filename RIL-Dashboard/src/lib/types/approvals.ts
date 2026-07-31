import type { Order } from './order';
import type { ActivityEntry, AttachedDocument, Milestone, OrderDetail } from './orderDetail';
import type { JourneyStage } from './siteOps';
import type { Tone } from './ui';

/** The five execution gates that need a human decision — RIL.md §4 Governance. */
export type DecisionTrack = 'security' | 'documents' | 'qc' | 'governance' | 'finance';

export type DecisionUrgency = 'breached' | 'today' | 'scheduled';

export type DecisionPriority = 'Critical' | 'High' | 'Medium';

export type DecisionAction = 'approve' | 'reject' | 'escalate' | 'delegate';

export interface DecisionOwner {
  name: string;
  role: string;
}

export interface DecisionNote {
  at: string;
  note: string;
}

export interface DecisionRisk {
  tone: Tone;
  label: string;
}

export interface PreviousApproval {
  gate: string;
  owner: string;
  at: string;
}

/** One pending decision — derived from an order and its active execution gate. */
export interface PendingDecision {
  id: string;
  order: Order;
  detail: OrderDetail;
  milestone: Milestone;
  gateKey: string;
  gateLabel: string;
  track: DecisionTrack;
  trackLabel: string;
  owner: DecisionOwner;
  mine: boolean;
  myTeam: boolean;
  /** The single sentence the reviewer is answering. */
  question: string;
  context: string;
  raisedAt: string;
  dueAt: string;
  waitingDays: number;
  dueInDays: number;
  slaDays: number;
  /** Share of the decision window already used, 0–100. */
  slaConsumed: number;
  urgency: DecisionUrgency;
  priority: DecisionPriority;
  escalated: boolean;
  blocked: boolean;
  stages: JourneyStage[];
  risks: DecisionRisk[];
  notes: DecisionNote[];
  documents: AttachedDocument[];
  activity: ActivityEntry[];
  previousApprovals: PreviousApproval[];
  upcoming: { gate: string; owner: string; role: string }[];
}

export interface DecisionRecord {
  id: string;
  orderId: string;
  gateLabel: string;
  action: DecisionAction;
  actor: string;
  /** ISO datetime on the demo clock. */
  at: string;
  note: string;
  delegateTo?: string;
}

export interface DecisionSubmission {
  action: DecisionAction;
  note: string;
  reason?: string;
  delegateTo?: string;
}
