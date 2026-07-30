import type { ContractType } from '../../lib/types/order';

export type Priority = 'Critical' | 'High' | 'Standard';
export type StakeholderRole = 'Project Manager' | 'Site Engineer' | 'QC Lead' | 'Security Officer' | 'Finance Owner';
export type StepKey = 'details' | 'workflow' | 'team' | 'documents' | 'review';
export type DraftState = 'idle' | 'saving' | 'saved';
export type FieldKey =
  | 'vendor'
  | 'plant'
  | 'contractType'
  | 'poNumber'
  | 'contractNumber'
  | 'orderValue'
  | 'completionDate'
  | 'priority';

export interface Milestone {
  label: string;
  owner: StakeholderRole;
  durationDays: number;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: StakeholderRole;
  plant: string;
}

export interface StepConfig {
  key: StepKey;
  label: string;
}

export type ContractOption = { value: ContractType; label: ContractType };
export type PriorityOption = { value: Priority; label: Priority };
