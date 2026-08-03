import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ShieldCheck,
  X,
} from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import JourneyRail from '../components/ui/JourneyRail';
import KeyValue from '../components/ui/KeyValue';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import Select from '../components/ui/Select';
import StepNavigation from '../components/ui/StepNavigation';
import TextField from '../components/ui/TextField';
import Toast from '../components/ui/Toast';

import { formatDate } from '../lib/format';
import { useNotifications } from '../lib/notifications/NotificationsContext';
import { buildJourney, GATES, VEHICLE_TYPES } from '../lib/mockData/siteOps';
import { ORDER_PLANTS } from '../lib/mockData/orders';
import { getOrders } from '../lib/orderStore';
import { getMovement, nextMovementId, recordMovement, verifyPass } from '../lib/siteOpsStore';
import type { Plant } from '../lib/types/order';
import type { MovementDirection, MovementDraft } from '../lib/types/siteOps';
import type { Tone } from '../lib/types/ui';

type StepKey = 'movement' | 'vehicle' | 'clearance';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'movement', label: 'Movement' },
  { key: 'vehicle', label: 'Vehicle & Weighment' },
  { key: 'clearance', label: 'Clearance & Manpower' },
];

const DIRECTION_OPTIONS: { value: MovementDirection; label: string }[] = [
  { value: 'Gate-In', label: 'Gate-In' },
  { value: 'Gate-Out', label: 'Gate-Out' },
];

const PHOTO_SLOTS = ['Vehicle front with number plate', 'Consignment condition', 'Gate pass', 'Weighbridge slip'];

const PASS_MESSAGE: Record<string, { tone: Tone; label: string }> = {
  valid: { tone: 'success', label: 'Pass verified' },
  expiring: { tone: 'warning', label: 'Pass expiring soon' },
  expired: { tone: 'danger', label: 'Pass expired' },
  unknown: { tone: 'danger', label: 'Not on the registry' },
};

function emptyDraft(): MovementDraft {
  return {
    direction: 'Gate-In',
    plant: 'Jamnagar',
    gate: GATES[0],
    orderId: '',
    vendor: '',
    vehicle: '',
    vehicleType: VEHICLE_TYPES[0],
    driver: '',
    driverContact: '',
    transporter: '',
    material: '',
    passId: '',
    passHolder: '',
    grossKg: '',
    tareKg: '',
    labourIn: '',
    labourOut: '',
    remarks: '',
    photos: [],
  };
}

function filled(value: string): boolean {
  return value.trim().length > 0;
}

function numeric(value: string): boolean {
  return filled(value) && Number.isFinite(Number(value)) && Number(value) >= 0;
}

export default function RecordMovement() {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [params] = useSearchParams();
  const orders = useMemo(() => getOrders(), []);

  const [draft, setDraft] = useState<MovementDraft>(() => {
    const source = getMovement(params.get('movement') ?? undefined);
    if (!source) return emptyDraft();
    return {
      ...emptyDraft(),
      direction: source.direction,
      plant: source.plant,
      gate: source.gate,
      orderId: source.orderId,
      vendor: source.vendor,
      vehicle: source.vehicle,
      vehicleType: source.vehicleType,
      driver: source.driver,
      driverContact: source.driverContact,
      transporter: source.transporter,
      material: source.material,
      passId: source.pass.id,
      passHolder: source.pass.holder,
    };
  });

  const [activeStep, setActiveStep] = useState<StepKey>('movement');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const movementId = useMemo(() => nextMovementId(), []);
  const pass = verifyPass(draft.passId);
  const net =
    numeric(draft.grossKg) && numeric(draft.tareKg) ? Number(draft.grossKg) - Number(draft.tareKg) : null;

  function set<K extends keyof MovementDraft>(key: K, value: MovementDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectOrder(orderId: string) {
    const order = orders.find((candidate) => candidate.id === orderId);
    setDraft((current) => ({
      ...current,
      orderId,
      vendor: order?.vendor ?? current.vendor,
      plant: order?.plant ?? current.plant,
    }));
  }

  const checks: Record<StepKey, { label: string; done: boolean }[]> = {
    movement: [
      { label: 'Direction selected', done: filled(draft.direction) },
      { label: 'Plant and gate selected', done: filled(draft.plant) && filled(draft.gate) },
      { label: 'Order linked', done: filled(draft.orderId) },
      { label: 'Material described', done: filled(draft.material) },
    ],
    vehicle: [
      { label: 'Vehicle number', done: filled(draft.vehicle) },
      { label: 'Driver and contact', done: filled(draft.driver) && filled(draft.driverContact) },
      { label: 'Transporter', done: filled(draft.transporter) },
      { label: 'Gross weight', done: numeric(draft.grossKg) },
      { label: 'Tare weight', done: numeric(draft.tareKg) },
    ],
    clearance: [
      { label: 'Security pass verified', done: pass.state === 'valid' || pass.state === 'expiring' },
      { label: 'Headcount in', done: numeric(draft.labourIn) },
      { label: 'Headcount out', done: numeric(draft.labourOut) },
      { label: 'Gate photograph attached', done: draft.photos.length > 0 },
    ],
  };

  const completed: Record<StepKey, boolean> = {
    movement: checks.movement.every((check) => check.done),
    vehicle: checks.vehicle.every((check) => check.done),
    clearance: checks.clearance.every((check) => check.done),
  };

  const highestUnlockedIndex = STEPS.length - 1;
  const activeIndex = STEPS.findIndex((step) => step.key === activeStep);
  const allValid = completed.movement && completed.vehicle && completed.clearance;
  const progress = Math.round(
    (Object.values(completed).filter(Boolean).length / STEPS.length) * 100,
  );

  function addPhoto() {
    const next = PHOTO_SLOTS[draft.photos.length] ?? `Site photograph ${draft.photos.length + 1}`;
    set('photos', [...draft.photos, next]);
  }

  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const movement = recordMovement(draft);
      notify({
        title: `Gate ${movement.direction.toLowerCase()} recorded`,
        description: `${movement.vehicle} · ${movement.id}`,
        module: 'Site Operations',
        orderId: movement.orderId,
        to: '/site-operations',
        toast: false,
      });
      navigate('/site-operations', {
        state: {
          toast: `Recorded ${movement.id} — ${movement.direction} for ${movement.vehicle}.`,
          movementId: movement.id,
        },
      });
    }, 650);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 pb-6">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Record Movement"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Site Operations', to: '/site-operations' },
              { label: 'Record Movement' },
            ]}
            actions={
              <>
                <Badge variant="glass">{movementId}</Badge>
                <Button
                  variant="secondary"
                  icon={<ArrowLeft size={16} strokeWidth={2.2} />}
                  onClick={() => navigate('/site-operations')}
                  className="cursor-pointer"
                >
                  Back to Site Operations
                </Button>
              </>
            }
          />
          {/* <p className="text-meta mt-1">
            Capture a gate movement with its vehicle, weighment, security clearance and manpower.
          </p> */}
        </div>

        <Section
          title="Movement Readiness"
          description={`${Object.values(completed).filter(Boolean).length} of ${STEPS.length} sections complete.`}
          actions={
            <div className="flex min-w-[220px] items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-chip-neutral)]">
                <div
                  className="h-full rounded-[var(--radius-sm)] bg-brand-600 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-body-strong tabular-nums">{progress}%</span>
            </div>
          }
          padded={false}
          headClassName="bg-[var(--color-brand-soft2)]"
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
        >
          <StepNavigation
            steps={STEPS}
            activeStep={activeStep}
            highestUnlockedIndex={highestUnlockedIndex}
            completed={completed}
            onStepChange={(step) => {
              const index = STEPS.findIndex((item) => item.key === step);
              if (index <= highestUnlockedIndex) setActiveStep(step);
            }}
          />
        </Section>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div key={activeStep} className="animate-panel flex min-w-0 flex-col gap-4">
            {activeStep === 'movement' && (
              <Section title="Movement" description="Where the vehicle is entering or leaving, and what it carries.">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-700">Direction</span>
                    <Select
                      value={draft.direction}
                      onChange={(value) => set('direction', value)}
                      options={DIRECTION_OPTIONS}
                      ariaLabel="Direction"
                      className="w-full"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-700">Plant</span>
                    <Select
                      value={draft.plant}
                      onChange={(value) => set('plant', value as Plant)}
                      options={ORDER_PLANTS.map((value) => ({ value, label: value }))}
                      ariaLabel="Plant"
                      className="w-full"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-700">Gate</span>
                    <Select
                      value={draft.gate}
                      onChange={(value) => set('gate', value)}
                      options={GATES.map((value) => ({ value, label: value }))}
                      ariaLabel="Gate"
                      className="w-full"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-700">Order</span>
                    <Select
                      value={draft.orderId}
                      onChange={selectOrder}
                      options={orders.map((order) => ({ value: order.id, label: `${order.id} · ${order.vendor}` }))}
                      ariaLabel="Order"
                      placeholder="Link an order"
                      className="w-full"
                    />
                  </label>
                  <TextField label="Vendor" value={draft.vendor} onChange={(value) => set('vendor', value)} placeholder="Derived from the linked order" />
                  <TextField label="Material" value={draft.material} onChange={(value) => set('material', value)} placeholder="Consignment description" />
                </div>
              </Section>
            )}

            {activeStep === 'vehicle' && (
              <Section title="Vehicle & Weighment" description="Vehicle identity, driver details and the weighbridge reading.">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField label="Vehicle number" value={draft.vehicle} onChange={(value) => set('vehicle', value)} placeholder="GJ-01-AB-4521" />
                  <label className="grid gap-1.5">
                    <span className="text-[13px] font-semibold text-ink-700">Vehicle type</span>
                    <Select
                      value={draft.vehicleType}
                      onChange={(value) => set('vehicleType', value)}
                      options={VEHICLE_TYPES.map((value) => ({ value, label: value }))}
                      ariaLabel="Vehicle type"
                      className="w-full"
                    />
                  </label>
                  <TextField label="Driver" value={draft.driver} onChange={(value) => set('driver', value)} placeholder="Name on the licence" />
                  <TextField label="Driver contact" value={draft.driverContact} onChange={(value) => set('driverContact', value)} placeholder="+91" />
                  <TextField label="Transporter" value={draft.transporter} onChange={(value) => set('transporter', value)} placeholder="Carrier name" />
                  <div />
                  <TextField label="Gross weight (kg)" type="number" value={draft.grossKg} onChange={(value) => set('grossKg', value)} />
                  <TextField label="Tare weight (kg)" type="number" value={draft.tareKg} onChange={(value) => set('tareKg', value)} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
                  <span className="text-body-strong">Net weight</span>
                  <span className="text-[16px] font-semibold text-ink-900 tabular-nums">
                    {net === null ? '—' : `${net.toLocaleString('en-IN')} kg`}
                  </span>
                </div>
              </Section>
            )}

            {activeStep === 'clearance' && (
              <>
                <Section title="Security Clearance" description="The pass is checked against the security registry as it is typed.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField label="Security pass" value={draft.passId} onChange={(value) => set('passId', value)} placeholder="SP-2151" />
                    <TextField label="Pass holder" value={draft.passHolder} onChange={(value) => set('passHolder', value)} placeholder="Name on the pass" />
                  </div>

                  {pass.state !== 'idle' && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-body-strong truncate">
                          {pass.holder ?? draft.passId.trim().toUpperCase()}
                        </div>
                        <div className="text-meta">
                          {pass.validTo ? `Valid to ${formatDate(pass.validTo)}` : 'No matching pass on the security registry'}
                        </div>
                      </div>
                      <Badge tone={PASS_MESSAGE[pass.state].tone} shape="square">
                        {PASS_MESSAGE[pass.state].label}
                      </Badge>
                    </div>
                  )}
                </Section>

                <Section title="Manpower" description="Headcount crossing the gate with this movement.">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField label="Headcount in" type="number" value={draft.labourIn} onChange={(value) => set('labourIn', value)} />
                    <TextField label="Headcount out" type="number" value={draft.labourOut} onChange={(value) => set('labourOut', value)} />
                  </div>
                </Section>

                <Section title="Evidence & Remarks" description="Gate photographs and any note the next shift should read.">
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="focus-bloom flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-6 text-center transition-colors hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white">
                      <Camera size={19} strokeWidth={2.2} className="text-brand-700" />
                    </span>
                    <span className="text-body-strong">Attach vehicle and consignment photographs</span>
                  </button>

                  {draft.photos.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {draft.photos.map((photo) => (
                        <Badge key={photo} tone="neutral" variant="glass" shape="square" icon={<Camera size={12} strokeWidth={2.3} />}>
                          {photo}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <TextField
                    label="Remarks"
                    value={draft.remarks}
                    onChange={(value) => set('remarks', value)}
                    placeholder="Handover note for the gate desk"
                    className="mt-4"
                  />
                </Section>
              </>
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-0 xl:self-start">
            <Section title="Journey Preview" description="The route this movement will follow through the plant.">
              <JourneyRail stages={buildJourney(draft.direction, 1)} size="sm" showTimes={false} />
            </Section>

            <Section title="Movement Summary">
              <KeyValue
                columns={2}
                items={[
                  { label: 'Direction', value: draft.direction },
                  { label: 'Gate', value: draft.gate },
                  { label: 'Plant', value: draft.plant },
                  { label: 'Order', value: draft.orderId || '—' },
                  { label: 'Vendor', value: draft.vendor || '—' },
                  { label: 'Vehicle', value: draft.vehicle.toUpperCase() || '—' },
                  { label: 'Net weight', value: net === null ? '—' : `${net.toLocaleString('en-IN')} kg` },
                  { label: 'Headcount', value: `${draft.labourIn || 0} in / ${draft.labourOut || 0} out` },
                ]}
              />
            </Section>

            <Section
              title="Validation"
              actions={
                <Badge tone={allValid ? 'success' : 'warning'} shape="square">
                  {allValid ? 'Ready to record' : 'Incomplete'}
                </Badge>
              }
            >
              <ul className="grid gap-2">
                {checks[activeStep].map((check) => (
                  <li key={check.label} className="flex items-start gap-2 text-body">
                    {check.done ? (
                      <Check size={14} strokeWidth={2.8} className="mt-0.5 flex-none text-success" />
                    ) : (
                      <X size={14} strokeWidth={2.8} className="mt-0.5 flex-none text-ink-400" />
                    )}
                    {check.label}
                  </li>
                ))}
              </ul>
            </Section>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mb-10">
        <div className="border-t border-[var(--color-border)] bg-[var(--color-brand-soft2)] p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              icon={<ArrowLeft size={16} strokeWidth={2.2} />}
              disabled={activeIndex === 0}
              onClick={() => setActiveStep(STEPS[Math.max(0, activeIndex - 1)].key)}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="ghost" onClick={() => navigate('/site-operations')} className="cursor-pointer">
                Cancel
              </Button>
              {activeStep === 'clearance' ? (
                <Button
                  variant="primary"
                  icon={<ShieldCheck size={16} strokeWidth={2.2} />}
                  loading={submitting}
                  onClick={handleSubmit}
                  className="cursor-pointer"
                >
                  Record Movement
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} strokeWidth={2.2} />}
                  iconPosition="right"
                  onClick={() => setActiveStep(STEPS[activeIndex + 1].key)}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
