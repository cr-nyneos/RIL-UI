// Single access point for site-operations data. When MockDataProvider lands
// (RIL.md Phase 5) only this file changes — pages read through useSiteOperations.

import { useSyncExternalStore } from 'react';
import { buildJourney, MANPOWER, MOVEMENTS, SCHEDULED_ARRIVAL, SITE_CLOCK } from './mockData/siteOps';
import type { ActivityEntry } from './types/orderDetail';
import type { ManpowerRecord, Movement, MovementDraft } from './types/siteOps';

let movements: Movement[] = MOVEMENTS;
let manpower: ManpowerRecord[] = MANPOWER;

const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getVersion(): number {
  return version;
}

export function nextMovementId(): string {
  const max = movements.reduce((current, movement) => {
    const value = Number(movement.id.replace('GT-', ''));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 4100);

  return `GT-${max + 1}`;
}

/** Vehicles physically inside the plant — every derived count reads this predicate. */
export function isOnSite(movement: Movement): boolean {
  return movement.status === 'On Site' || movement.status === 'Delayed' || movement.status === 'Blocked' || movement.status === 'Awaiting Exit';
}

export function needsAttention(movement: Movement): boolean {
  return movement.status === 'Blocked' || movement.status === 'Delayed';
}

export function dwellMinutes(movement: Movement, clock: Date = SITE_CLOCK): number | null {
  if (!movement.entryAt) return null;
  const entry = new Date(movement.entryAt).getTime();
  const end = movement.exitAt ? new Date(movement.exitAt).getTime() : clock.getTime();
  return Math.max(0, Math.round((end - entry) / 60_000));
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function scheduledArrival(movement: Movement): string | undefined {
  return SCHEDULED_ARRIVAL[movement.id];
}

export function netWeight(movement: Movement): number | null {
  const { grossKg, tareKg } = movement.weighment;
  if (grossKg === null || tareKg === null) return null;
  return grossKg - tareKg;
}

export function currentStage(movement: Movement) {
  return (
    movement.stages.find((stage) => stage.state === 'current' || stage.state === 'blocked' || stage.state === 'delayed') ??
    movement.stages[movement.stages.length - 1]
  );
}

export type PassCheckState = 'idle' | 'unknown' | 'valid' | 'expiring' | 'expired';

export interface PassCheck {
  state: PassCheckState;
  holder?: string;
  validTo?: string;
}

/** Live verification against the pass registry — RIL.md E4 / feature #9. */
export function verifyPass(passId: string, clock: Date = SITE_CLOCK): PassCheck {
  const id = passId.trim().toUpperCase();
  if (!id) return { state: 'idle' };

  const match = movements.find((movement) => movement.pass.id.toUpperCase() === id);
  if (!match) return { state: 'unknown' };

  const validTo = new Date(`${match.pass.validTo}T23:59:59`);
  const days = Math.round((validTo.getTime() - clock.getTime()) / 86_400_000);

  return {
    state: days < 0 ? 'expired' : days <= 7 ? 'expiring' : 'valid',
    holder: match.pass.holder,
    validTo: match.pass.validTo,
  };
}

export interface SiteOperationsSummary {
  vehiclesOnSite: number;
  entriesToday: number;
  exitsToday: number;
  activeWorkforce: number;
  averageDwellMinutes: number | null;
}

function summarise(movementList: Movement[], manpowerList: ManpowerRecord[]): SiteOperationsSummary {
  const onSite = movementList.filter(isOnSite);
  const dwells = onSite.map((movement) => dwellMinutes(movement)).filter((value): value is number => value !== null);

  return {
    vehiclesOnSite: onSite.length,
    entriesToday: movementList.filter((movement) => movement.entryAt !== null).length,
    exitsToday: movementList.filter((movement) => movement.exitAt !== null).length,
    activeWorkforce: manpowerList.reduce((total, record) => total + record.current, 0),
    averageDwellMinutes: dwells.length ? Math.round(dwells.reduce((total, value) => total + value, 0) / dwells.length) : null,
  };
}

export interface SiteOperationsResult {
  movements: Movement[];
  manpower: ManpowerRecord[];
  summary: SiteOperationsSummary;
  activity: ActivityEntry[];
  clock: Date;
}

export function useSiteOperations(): SiteOperationsResult {
  useSyncExternalStore(subscribe, getVersion, getVersion);

  return {
    movements,
    manpower,
    summary: summarise(movements, manpower),
    activity: movements
      .flatMap((movement) => movement.activity)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    clock: SITE_CLOCK,
  };
}

export function getMovement(id: string | undefined): Movement | undefined {
  return id ? movements.find((movement) => movement.id === id) : undefined;
}

function parseNumber(value: string): number | null {
  const numeric = Number(value.replace(/[^\d.-]/g, ''));
  return value.trim() && Number.isFinite(numeric) ? numeric : null;
}

function stampNow(): string {
  return `${SITE_CLOCK.toISOString().slice(0, 10)}T${String(SITE_CLOCK.getHours()).padStart(2, '0')}:${String(
    SITE_CLOCK.getMinutes(),
  ).padStart(2, '0')}:00`;
}

/**
 * Recording a movement appends to the in-memory store, adjusts the vendor's
 * live headcount and writes an activity entry — RIL.md §8.
 */
export function recordMovement(draft: MovementDraft, actor = 'Gate Desk'): Movement {
  const id = nextMovementId();
  const timestamp = stampNow();
  const labourIn = parseNumber(draft.labourIn) ?? 0;
  const labourOut = parseNumber(draft.labourOut) ?? 0;

  const movement: Movement = {
    id,
    direction: draft.direction,
    vehicle: draft.vehicle.trim().toUpperCase(),
    vehicleType: draft.vehicleType,
    driver: draft.driver.trim(),
    driverContact: draft.driverContact.trim(),
    transporter: draft.transporter.trim(),
    vendor: draft.vendor,
    orderId: draft.orderId,
    plant: draft.plant,
    gate: draft.gate,
    zone: draft.direction === 'Gate-In' ? 'Entry Lane 1' : 'Loading Bay 2',
    material: draft.material.trim() || 'Consignment',
    status: 'On Site',
    entryAt: timestamp,
    expectedExit: `${timestamp.slice(0, 11)}${String(Math.min(23, SITE_CLOCK.getHours() + 5)).padStart(2, '0')}:00:00`,
    exitAt: null,
    pass: {
      id: draft.passId.trim() || 'SP-0000',
      holder: draft.passHolder.trim() || draft.driver.trim(),
      validTo: '2026-12-31',
      status: 'Verified',
    },
    weighment: { grossKg: parseNumber(draft.grossKg), tareKg: parseNumber(draft.tareKg) },
    labourIn,
    labourOut,
    remarks: draft.remarks.trim() || null,
    photos: draft.photos,
    documents: draft.photos.map((photo, index) => ({
      id: `${id}-photo-${index + 1}`,
      name: photo,
      type: 'Gate Evidence',
      status: 'Submitted',
      uploadedBy: actor,
      uploadedAt: 'Today',
    })),
    activity: [
      {
        id: `${id}-act-1`,
        actor,
        action: `recorded a ${draft.direction} movement for ${draft.vehicle.trim().toUpperCase()} at ${draft.gate}`,
        target: { label: draft.orderId, to: `/orders/${draft.orderId}` },
        timestamp,
        type: 'delivery',
      },
    ],
    stages: buildJourney(draft.direction, 1, 'none', { entry: timestamp }),
  };

  movements = [movement, ...movements];

  if (labourIn || labourOut) {
    manpower = manpower.map((record) =>
      record.vendor === draft.vendor && record.plant === draft.plant
        ? {
            ...record,
            current: Math.max(0, record.current + labourIn - labourOut),
            enteredToday: record.enteredToday + labourIn,
            exitedToday: record.exitedToday + labourOut,
          }
        : record,
    );
  }

  emit();
  return movement;
}
