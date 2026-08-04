import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CloudUpload, FileText, UserPlus, X } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import KeyValue from '../components/ui/KeyValue';
import PageHeader from '../components/ui/PageHeader';
import ProgressMeter from '../components/ui/ProgressMeter';
import SectionCard from '../components/ui/SectionCard';
import Select from '../components/ui/Select';
import StepNavigation from '../components/ui/StepNavigation';
import Switch from '../components/ui/Switch';
import TextField from '../components/ui/TextField';

import { useNotifications } from '../lib/notifications/NotificationsContext';
import { ORDER_PLANTS } from '../lib/mockData/orders';
import { VENDOR_CATEGORIES } from '../lib/mockData/vendors';
import { createVendor, nextVendorId } from '../lib/vendorStore';
import type { Plant } from '../lib/types/order';
import type { VendorCategory } from '../lib/types/vendor';
import {
  CONTACT_ROLES,
  KYC_DOCUMENTS,
  ONBOARD_STEPS,
  createDummyDraft,
  type OnboardStepKey,
  type VendorDraft,
} from './onboard-vendor/constants';

const CATEGORY_OPTIONS = VENDOR_CATEGORIES.map((category) => ({ value: category, label: category }));
const ROLE_OPTIONS = CONTACT_ROLES.map((role) => ({ value: role, label: role }));
const REQUIRED_DOCUMENTS = KYC_DOCUMENTS.filter((document) => document.required);

function filled(value: string): boolean {
  return value.trim().length > 0;
}

export default function OnboardVendor() {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [draft, setDraft] = useState<VendorDraft>(createDummyDraft);
  const [activeStep, setActiveStep] = useState<OnboardStepKey>('company');
  const [submitting, setSubmitting] = useState(false);

  const vendorId = useMemo(() => nextVendorId(), []);

  function set<K extends keyof VendorDraft>(key: K, value: VendorDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function togglePlant(plant: Plant) {
    set(
      'plants',
      draft.plants.includes(plant)
        ? draft.plants.filter((item) => item !== plant)
        : [...draft.plants, plant],
    );
  }

  function toggleDocument(name: string) {
    set('documents', { ...draft.documents, [name]: !draft.documents[name] });
  }

  function uploadAll() {
    set('documents', Object.fromEntries(KYC_DOCUMENTS.map((document) => [document.name, true])));
  }

  const collected = KYC_DOCUMENTS.filter((document) => draft.documents[document.name]).length;
  const compliance = Math.round((collected / KYC_DOCUMENTS.length) * 100);

  const checks: Record<OnboardStepKey, { label: string; done: boolean }[]> = {
    company: [
      { label: 'Vendor name', done: filled(draft.name) },
      { label: 'Vendor code', done: filled(draft.code) },
      { label: 'Registered office', done: filled(draft.city) },
      { label: 'At least one plant', done: draft.plants.length > 0 },
    ],
    kyc: [
      { label: 'Primary contact', done: filled(draft.contactName) },
      { label: 'Email address', done: filled(draft.email) },
      { label: 'Phone number', done: filled(draft.phone) },
      { label: 'GSTIN', done: filled(draft.gstin) },
    ],
    documents: REQUIRED_DOCUMENTS.map((document) => ({
      label: document.name,
      done: Boolean(draft.documents[document.name]),
    })),
    review: [],
  };

  const completed: Record<OnboardStepKey, boolean> = {
    company: checks.company.every((check) => check.done),
    kyc: checks.kyc.every((check) => check.done),
    documents: checks.documents.every((check) => check.done),
    review: false,
  };
  completed.review = completed.company && completed.kyc && completed.documents;

  const activeIndex = ONBOARD_STEPS.findIndex((step) => step.key === activeStep);
  const highestUnlockedIndex = ONBOARD_STEPS.length - 1;
  const readiness = Math.round(
    (Object.values(completed).filter(Boolean).length / ONBOARD_STEPS.length) * 100,
  );

  function handleSubmit() {
    if (submitting || !completed.review) return;
    setSubmitting(true);

    window.setTimeout(() => {
      const vendor = createVendor({
        name: draft.name,
        code: draft.code,
        category: draft.category,
        plants: draft.plants,
        city: draft.city,
        contactName: draft.contactName,
        contactRole: draft.contactRole,
        email: draft.email,
        phone: draft.phone,
        gstin: draft.gstin,
        msme: draft.msme,
        collected,
        total: KYC_DOCUMENTS.length,
      });

      notify({
        title: `${vendor.name} onboarded`,
        description: `${vendor.id} added to the directory · ${collected} of ${KYC_DOCUMENTS.length} documents collected`,
        module: 'Vendors',
        orderId: vendor.id,
        to: `/vendors/${vendor.id}`,
      });

      navigate(`/vendors/${vendor.id}`);
    }, 650);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 pb-6">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Onboard Vendor"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Vendors', to: '/vendors' },
              { label: 'Onboard Vendor' },
            ]}
            actions={
              <>
                <Badge variant="glass">{vendorId}</Badge>
                <Button
                  variant="secondary"
                  icon={<ArrowLeft size={16} strokeWidth={2.2} />}
                  className="cursor-pointer"
                  onClick={() => navigate('/vendors')}
                >
                  Back to Directory
                </Button>
              </>
            }
          />
        </div>

        <SectionCard
          title="Onboarding Readiness"
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
          actions={
            <div className="flex min-w-[220px] items-center gap-3">
              <ProgressMeter value={readiness} className="flex-1" />
              <span className="text-body-strong tabular-nums">{readiness}%</span>
            </div>
          }
        >
          <StepNavigation
            steps={ONBOARD_STEPS}
            activeStep={activeStep}
            highestUnlockedIndex={highestUnlockedIndex}
            completed={completed}
            onStepChange={setActiveStep}
          />
        </SectionCard>

        <div key={activeStep} className="animate-panel flex min-w-0 flex-col gap-4">
          {activeStep === 'company' && (
            <SectionCard title="Company Details">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Vendor name" value={draft.name} onChange={(value) => set('name', value)} />
                <TextField label="Vendor code" value={draft.code} onChange={(value) => set('code', value)} />
                <label className="grid gap-1.5">
                  <span className="text-[15px] font-semibold text-ink-700">Category</span>
                  <Select
                    value={draft.category}
                    onChange={(value) => set('category', value as VendorCategory)}
                    options={CATEGORY_OPTIONS}
                    ariaLabel="Vendor category"
                    className="w-full"
                  />
                </label>
                <TextField label="Registered office" value={draft.city} onChange={(value) => set('city', value)} />
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-[15px] font-semibold text-ink-700">Plant presence</span>
                <div className="flex flex-wrap gap-2">
                  {ORDER_PLANTS.map((plant) => {
                    const active = draft.plants.includes(plant);
                    return (
                      <button
                        key={plant}
                        type="button"
                        aria-pressed={active}
                        className="focus-bloom cursor-pointer rounded-[var(--radius-md)]"
                        onClick={() => togglePlant(plant)}
                      >
                        <Badge
                          size="md"
                          tone={active ? 'brand' : 'neutral'}
                          className="px-3 py-1 text-[14px] leading-5"
                        >
                          {plant}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          )}

          {activeStep === 'kyc' && (
            <SectionCard title="KYC & Contact">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Primary contact"
                  value={draft.contactName}
                  onChange={(value) => set('contactName', value)}
                />
                <label className="grid gap-1.5">
                  <span className="text-[15px] font-semibold text-ink-700">Contact role</span>
                  <Select
                    value={draft.contactRole}
                    onChange={(value) => set('contactRole', value)}
                    options={ROLE_OPTIONS}
                    ariaLabel="Contact role"
                    className="w-full"
                  />
                </label>
                <TextField label="Email" value={draft.email} onChange={(value) => set('email', value)} />
                <TextField label="Phone" value={draft.phone} onChange={(value) => set('phone', value)} />
                <TextField label="GSTIN" value={draft.gstin} onChange={(value) => set('gstin', value)} />
                <div className="flex items-end">
                  <Switch
                    label="MSME registered"
                    checked={draft.msme}
                    onChange={(checked) => set('msme', checked)}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {activeStep === 'documents' && (
            <SectionCard
              title="Document Package"
              actions={
                <Badge tone={completed.documents ? 'success' : 'warning'} shape="square">
                  {collected} of {KYC_DOCUMENTS.length} collected
                </Badge>
              }
            >
              <label className="glass-inset mb-5 flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-glass-hairline-deep)] p-8 text-center transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)]">
                <input type="file" multiple className="sr-only" onChange={uploadAll} />
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-selected)] text-brand-700">
                  <CloudUpload size={24} strokeWidth={2.2} />
                </span>
                <span className="text-body-strong">Upload the KYC package</span>
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {KYC_DOCUMENTS.map((document) => {
                  const uploaded = draft.documents[document.name];
                  return (
                    <button
                      key={document.name}
                      type="button"
                      onClick={() => toggleDocument(document.name)}
                      className="glass-inset flex min-h-[118px] cursor-pointer flex-col items-start justify-between p-5 text-left transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)]"
                    >
                      <span className="flex w-full items-center justify-between gap-3">
                        <FileText size={18} strokeWidth={2.2} className="text-brand-700" />
                        {uploaded ? (
                          <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />
                        ) : (
                          <CloudUpload size={18} strokeWidth={2.2} className="text-ink-500" />
                        )}
                      </span>
                      <span>
                        <span className="text-body-strong block">{document.name}</span>
                        <span className="text-meta mt-1 block">
                          {uploaded ? 'Uploaded' : document.required ? 'Required' : 'Optional'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {activeStep === 'review' && (
            <SectionCard
              title="Review"
              actions={
                <Badge tone={completed.review ? 'success' : 'warning'} shape="square">
                  {completed.review ? 'Ready to onboard' : 'Incomplete'}
                </Badge>
              }
            >
              <KeyValue
                columns={4}
                items={[
                  { label: 'Vendor ID', value: vendorId },
                  { label: 'Vendor Name', value: draft.name },
                  { label: 'Vendor Code', value: draft.code.toUpperCase() },
                  { label: 'Category', value: draft.category },
                  { label: 'Plant Presence', value: draft.plants.join(', ') },
                  { label: 'Registered Office', value: draft.city },
                  { label: 'Primary Contact', value: `${draft.contactName} · ${draft.contactRole}` },
                  { label: 'Contact', value: `${draft.phone} · ${draft.email}` },
                  { label: 'GSTIN', value: draft.gstin.toUpperCase() },
                  { label: 'MSME Registered', value: draft.msme ? 'Yes' : 'No' },
                  { label: 'Documents Collected', value: `${collected} of ${KYC_DOCUMENTS.length}` },
                  { label: 'Compliance Score', value: `${compliance}%` },
                ]}
              />

              <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                <ul className="grid gap-2 md:grid-cols-2">
                  {[...checks.company, ...checks.kyc, ...checks.documents].map((check) => (
                    <li key={check.label} className="text-body flex items-start gap-2">
                      {check.done ? (
                        <Check size={14} strokeWidth={2.8} className="mt-1 flex-none text-success" />
                      ) : (
                        <X size={14} strokeWidth={2.8} className="mt-1 flex-none text-danger" />
                      )}
                      {check.label}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-brand-soft2)] p-3">
          <Button
            variant="secondary"
            icon={<ArrowLeft size={16} strokeWidth={2.2} />}
            disabled={activeIndex === 0}
            className="cursor-pointer"
            onClick={() => setActiveStep(ONBOARD_STEPS[Math.max(0, activeIndex - 1)].key)}
          >
            Previous
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" className="cursor-pointer" onClick={() => navigate('/vendors')}>
              Cancel
            </Button>
            {activeStep === 'review' ? (
              <Button
                variant="primary"
                icon={<UserPlus size={16} strokeWidth={2.2} />}
                loading={submitting}
                disabled={!completed.review || submitting}
                className="cursor-pointer"
                onClick={handleSubmit}
              >
                Onboard Vendor
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<ArrowRight size={16} strokeWidth={2.2} />}
                iconPosition="right"
                className="cursor-pointer"
                onClick={() => setActiveStep(ONBOARD_STEPS[activeIndex + 1].key)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
