export type ContractType = 'Manufactured' | 'Material';

export type Plant = 'Jamnagar' | 'Delhi' | 'Hyderabad' | 'Nagpur' | 'Surat';

export type GateState = 'done' | 'current' | 'locked';

export interface Gate {
  key: string;
  label: string;
  state: GateState;
}

export type ExceptionFlagType = 'delayed' | 'partial' | 'damaged' | 'missing' | 'blocked';

export interface ExceptionFlag {
  type: ExceptionFlagType;
  detail?: string;
}

export interface Order {
  id: string;
  po: string;
  vendor: string;
  plant: Plant;
  type: ContractType;
  status: string;
  progress: number;
  expected: string;
  valueCr: number;
  gates: Gate[];
  flags: ExceptionFlag[];
}
