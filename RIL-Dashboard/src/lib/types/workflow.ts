export type WorkflowKey = 'manufactured' | 'material';

export type WorkflowStatus = 'Active' | 'Draft';

export interface WorkflowStage {
  id: string;
  name: string;
  role: string;
  dependency: string;
  slaHours: number;
  escalation: string;
  documents: string[];
  autoUnlock: string;
  mandatory: boolean;
  notification?: string;
  enabled?: boolean;
}

export interface WorkflowRules {
  autoProgression: boolean;
  parallelApprovals: boolean;
  manualApproval: boolean;
  escalationEnabled: boolean;
  notification: string;
}

export interface Workflow {
  key: WorkflowKey;
  label: string;
  contractType: string;
  status: WorkflowStatus;
  stages: WorkflowStage[];
  rules: WorkflowRules;
}

export interface WorkflowRole {
  id: string;
  role: string;
  department: string;
  responsibility: string;
  stages: string[];
  escalationLevel: string;
  status: 'Active' | 'Inactive';
}
