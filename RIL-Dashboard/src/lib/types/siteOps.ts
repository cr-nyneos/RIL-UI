import type { Plant } from './order';
import type { ActivityEntry, AttachedDocument } from './orderDetail';

export type MovementDirection = 'Gate-In' | 'Gate-Out';

/** A journey node is either behind the vehicle, under it, or ahead of it. */
export type JourneyStageState = 'complete' | 'current' | 'upcoming' | 'blocked' | 'delayed';

export interface JourneyStage {
  key: string;
  label: string;
  state: JourneyStageState;
  /** ISO datetime recorded at this stage. */
  at?: string;
  note?: string;
}

/** Resolves through `getStatusTone` like every other status string in the product. */
export type MovementStatus = 'On Site' | 'Blocked' | 'Delayed' | 'Awaiting Exit' | 'Exited' | 'Scheduled';

export interface MovementPass {
  id: string;
  holder: string;
  validTo: string;
  status: string;
}

export interface MovementWeighment {
  grossKg: number | null;
  tareKg: number | null;
}

export interface Movement {
  id: string;
  direction: MovementDirection;
  vehicle: string;
  vehicleType: string;
  driver: string;
  driverContact: string;
  transporter: string;
  vendor: string;
  orderId: string;
  plant: Plant;
  gate: string;
  /** Where the vehicle physically is right now. */
  zone: string;
  material: string;
  status: MovementStatus;
  entryAt: string | null;
  expectedExit: string;
  exitAt: string | null;
  pass: MovementPass;
  weighment: MovementWeighment;
  labourIn: number;
  labourOut: number;
  remarks: string | null;
  photos: string[];
  documents: AttachedDocument[];
  activity: ActivityEntry[];
  stages: JourneyStage[];
  blockedReason?: string;
  delayMinutes?: number;
}

export interface ManpowerTrade {
  label: string;
  count: number;
}

export interface ManpowerRecord {
  id: string;
  vendor: string;
  plant: Plant;
  zone: string;
  supervisor: string;
  supervisorContact: string;
  current: number;
  enteredToday: number;
  exitedToday: number;
  shift: string;
  trades: ManpowerTrade[];
  inductionValidTo: string;
  passesExpiring: number;
  orderId: string;
}

export interface MovementDraft {
  direction: MovementDirection;
  plant: Plant;
  gate: string;
  orderId: string;
  vendor: string;
  vehicle: string;
  vehicleType: string;
  driver: string;
  driverContact: string;
  transporter: string;
  material: string;
  passId: string;
  passHolder: string;
  grossKg: string;
  tareKg: string;
  labourIn: string;
  labourOut: string;
  remarks: string;
  photos: string[];
}
