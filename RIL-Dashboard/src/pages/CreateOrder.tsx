import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, Landmark, Warehouse, X } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import StepNavigation from '../components/ui/StepNavigation';
import Toast from '../components/ui/Toast';
import { upsertWorkspaceOrder } from '../lib/orderStore';
import type { ContractType } from '../lib/types/order';
import CreateOrderSidebar from './create-order/CreateOrderSidebar';
import DetailsTab from './create-order/DetailsTab';
import DocumentsTab from './create-order/DocumentsTab';
import ReviewTab from './create-order/ReviewTab';
import TeamTab from './create-order/TeamTab';
import WorkflowTab from './create-order/WorkflowTab';
import { REQUIRED_DOCUMENTS, ROLE_ORDER, STEP_COPY, STEPS, WORKFLOWS } from './create-order/constants';
import { required } from './create-order/utils';
import type { DraftState, FieldKey, Priority, Stakeholder, StakeholderRole, StepKey } from './create-order/types';

export default function CreateOrder() {
  const navigate = useNavigate();
  const announcedCompletion = useRef<Partial<Record<StepKey, boolean>>>({});
  const [activeStep, setActiveStep] = useState<StepKey>('details');
  const [vendor, setVendor] = useState('');
  const [plant, setPlant] = useState('');
  const [contractType, setContractType] = useState<ContractType>('Manufactured');
  const [poNumber, setPoNumber] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Standard');
  const [description, setDescription] = useState('');
  const [workflowAccepted, setWorkflowAccepted] = useState(false);
  const [stakeholders, setStakeholders] = useState<Partial<Record<StakeholderRole, Stakeholder>>>({});
  const [documents, setDocuments] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REQUIRED_DOCUMENTS.map((document) => [document, false])),
  );
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  const workflow = WORKFLOWS[contractType];
  const assignedCount = ROLE_ORDER.filter((role) => stakeholders[role]).length;
  const uploadedCount = REQUIRED_DOCUMENTS.filter((document) => documents[document]).length;
  const totalDuration = workflow.reduce((total, milestone) => total + milestone.durationDays, 0);

  const detailsValid = required(vendor) && required(plant) && required(poNumber) && required(contractNumber)
    && required(orderValue) && required(completionDate) && required(priority) && required(contractType);
  const workflowValid = workflowAccepted && workflow.length > 0 && workflow.every((milestone) => ROLE_ORDER.includes(milestone.owner));
  const teamValid = assignedCount === ROLE_ORDER.length;
  const documentsValid = REQUIRED_DOCUMENTS.every((document) => documents[document]);
  const allValid = detailsValid && workflowValid && teamValid && documentsValid;

  const completed = useMemo<Record<StepKey, boolean>>(
    () => ({
      details: detailsValid,
      workflow: workflowValid,
      team: teamValid,
      documents: documentsValid,
      review: allValid,
    }),
    [allValid, detailsValid, documentsValid, teamValid, workflowValid],
  );

  const highestUnlockedIndex = useMemo(() => {
    let index = 0;
    if (detailsValid) index = 1;
    if (detailsValid && workflowValid) index = 2;
    if (detailsValid && workflowValid && teamValid) index = 3;
    if (detailsValid && workflowValid && teamValid && documentsValid) index = 4;
    return index;
  }, [detailsValid, documentsValid, teamValid, workflowValid]);

  const activeIndex = STEPS.findIndex((step) => step.key === activeStep);
  const completedCount = [detailsValid, workflowValid, teamValid, documentsValid, allValid].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);
  const canMoveNext = completed[activeStep] && activeIndex < STEPS.length - 1 && activeIndex + 1 <= highestUnlockedIndex;

  const markTouched = (field: FieldKey) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const meaningfulChange = () => {
    setIsDirty(true);
    setDraftState('saving');
  };

  const setField = (field: FieldKey, setter: (value: string) => void) => (value: string) => {
    markTouched(field);
    setter(value);
    meaningfulChange();
  };

  const setSelectField = <T extends string,>(field: FieldKey, setter: (value: T) => void) => (value: T) => {
    markTouched(field);
    setter(value);
    meaningfulChange();
    if (field === 'contractType') {
      setWorkflowAccepted(false);
    }
  };

  useEffect(() => {
    if (draftState !== 'saving') return undefined;
    const saved = window.setTimeout(() => {
      setDraftState('saved');
      setIsDirty(false);
    }, 700);
    const hidden = window.setTimeout(() => setDraftState('idle'), 3200);
    return () => {
      window.clearTimeout(saved);
      window.clearTimeout(hidden);
    };
  }, [draftState, vendor, plant, contractType, poNumber, contractNumber, orderValue, completionDate, priority, description, workflowAccepted, stakeholders, documents]);

  useEffect(() => {
    const complete = completed[activeStep];
    if (!complete || announcedCompletion.current[activeStep] || activeStep === 'review') return undefined;
    announcedCompletion.current[activeStep] = true;
    const toastTimer = window.setTimeout(() => {
      setToast(`${STEP_COPY[activeStep].title} completed. Click Next to continue.`);
    }, 0);
    return () => window.clearTimeout(toastTimer);
  }, [activeStep, completed]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty && draftState !== 'saving') return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [draftState, isDirty]);

  const detailChecks = useMemo(
    () => [
      { label: 'Vendor', done: required(vendor), touched: touched.vendor },
      { label: 'Plant', done: required(plant), touched: touched.plant },
      { label: 'Contract Type', done: required(contractType), touched: touched.contractType },
      { label: 'PO Number', done: required(poNumber), touched: touched.poNumber },
      { label: 'Contract Number', done: required(contractNumber), touched: touched.contractNumber },
      { label: 'Order Value', done: required(orderValue), touched: touched.orderValue },
      { label: 'Completion Date', done: required(completionDate), touched: touched.completionDate },
      { label: 'Priority', done: required(priority), touched: touched.priority },
    ],
    [completionDate, contractNumber, contractType, orderValue, plant, poNumber, priority, touched, vendor],
  );

  const activeValidation = useMemo(() => {
    if (activeStep === 'details') return detailChecks.map((item) => ({ ...item, waiting: !item.touched && !item.done }));
    if (activeStep === 'workflow') {
      return [
        { label: 'Workflow generated', done: workflowAccepted, waiting: false },
        { label: 'Milestones exist', done: workflow.length > 0, waiting: false },
        { label: 'Owners mapped', done: workflow.every((milestone) => ROLE_ORDER.includes(milestone.owner)), waiting: false },
      ];
    }
    if (activeStep === 'team') {
      return ROLE_ORDER.map((role) => ({ label: role, done: Boolean(stakeholders[role]), waiting: !stakeholders[role] }));
    }
    if (activeStep === 'documents') {
      return REQUIRED_DOCUMENTS.map((document) => ({ label: document, done: documents[document], waiting: !documents[document] }));
    }
    return [
      { label: 'Commercial details', done: detailsValid, waiting: false },
      { label: 'Workflow ready', done: workflowValid, waiting: false },
      { label: 'Team assigned', done: teamValid, waiting: false },
      { label: 'Documents uploaded', done: documentsValid, waiting: false },
    ];
  }, [activeStep, detailChecks, detailsValid, documents, documentsValid, stakeholders, teamValid, workflow, workflowAccepted, workflowValid]);

  const goToStep = (step: StepKey) => {
    const index = STEPS.findIndex((item) => item.key === step);
    if (index <= highestUnlockedIndex) setActiveStep(step);
  };

  const saveWorkspaceOrder = (mode: 'draft' | 'created') => {
    const order = upsertWorkspaceOrder(
      {
        vendor,
        plant,
        type: contractType,
        po: poNumber,
        expected: completionDate,
        value: orderValue,
      },
      mode,
    );

    setIsDirty(false);
    navigate('/orders', {
      state: {
        toast: mode === 'draft' ? `Saved ${order.id} as draft.` : `Created ${order.id} and added it to Orders.`,
      },
    });
  };

  const requestCancel = () => {
    if (isDirty || draftState === 'saving') {
      setShowLeaveDialog(true);
      return;
    }
    navigate('/orders');
  };

  const handleCreate = () => {
    if (!allValid) return;
    setCreating(true);
    setToast('Creating order...');
    window.setTimeout(() => saveWorkspaceOrder('created'), 900);
  };

  const renderActiveTab = () => {
    if (activeStep === 'details') {
      return (
        <DetailsTab
          vendor={vendor}
          plant={plant}
          contractType={contractType}
          priority={priority}
          poNumber={poNumber}
          contractNumber={contractNumber}
          orderValue={orderValue}
          completionDate={completionDate}
          description={description}
          touched={touched}
          setField={setField}
          setSelectField={setSelectField}
          setVendor={setVendor}
          setPlant={setPlant}
          setContractType={setContractType}
          setPriority={setPriority}
          setPoNumber={setPoNumber}
          setContractNumber={setContractNumber}
          setOrderValue={setOrderValue}
          setCompletionDate={setCompletionDate}
          setDescription={setDescription}
          meaningfulChange={meaningfulChange}
        />
      );
    }

    if (activeStep === 'workflow') {
      return (
        <WorkflowTab
          contractType={contractType}
          workflow={workflow}
          totalDuration={totalDuration}
          workflowAccepted={workflowAccepted}
          setWorkflowAccepted={setWorkflowAccepted}
          meaningfulChange={meaningfulChange}
        />
      );
    }

    if (activeStep === 'team') {
      return <TeamTab stakeholders={stakeholders} setStakeholders={setStakeholders} meaningfulChange={meaningfulChange} />;
    }

    if (activeStep === 'documents') {
      return <DocumentsTab documents={documents} setDocuments={setDocuments} meaningfulChange={meaningfulChange} />;
    }

    return (
      <ReviewTab
        allValid={allValid}
        vendor={vendor}
        plant={plant}
        poNumber={poNumber}
        contractNumber={contractNumber}
        orderValue={orderValue}
        completionDate={completionDate}
        priority={priority}
        contractType={contractType}
        workflow={workflow}
        totalDuration={totalDuration}
        stakeholders={stakeholders}
        documents={documents}
        setActiveStep={setActiveStep}
      />
    );
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4 pb-24">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            title="Create Order"
            actions={
              draftState !== 'idle' ? (
                <Badge tone={draftState === 'saving' ? 'warning' : 'success'} variant="glass">
                  {draftState === 'saving' ? 'Saving...' : 'Draft Saved'}
                </Badge>
              ) : undefined
            }
          />
        </div>

        <Section
          title="Order Creation Workflow"
          description={`${completedCount} of ${STEPS.length} steps completed.`}
          actions={
            <div className="flex min-w-[220px] items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-chip-neutral)]">
                <div
                  className="h-full rounded-[var(--radius-sm)] bg-brand-600 transition-[width] duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-body-strong tabular-nums">{progressPercent}%</span>
            </div>
          }
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
        >
          <StepNavigation
            steps={STEPS}
            activeStep={activeStep}
            highestUnlockedIndex={highestUnlockedIndex}
            completed={completed}
            onStepChange={goToStep}
          />
        </Section>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div key={activeStep} className="animate-panel min-w-0">
            {renderActiveTab()}
          </div>
          <CreateOrderSidebar
            key={`${activeStep}-summary`}
            activeStep={activeStep}
            completed={completed}
            activeValidation={activeValidation}
            vendor={vendor}
            plant={plant}
            contractType={contractType}
            orderValue={orderValue}
            priority={priority}
            completionDate={completionDate}
            workflow={workflow}
            totalDuration={totalDuration}
            assignedCount={assignedCount}
            uploadedCount={uploadedCount}
            stakeholders={stakeholders}
            documents={documents}
          />
        </div>
      </div>

      <div className="sticky bottom-4 z-20">
        <GlassCard className="p-3 shadow-[0_-2px_8px_-4px_rgba(16,24,40,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              icon={<ArrowLeft size={16} strokeWidth={2.2} />}
              disabled={activeIndex === 0}
              onClick={() => setActiveStep(STEPS[Math.max(0, activeIndex - 1)].key)}
            >
              Previous
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="ghost" icon={<Flag size={16} strokeWidth={2.2} />} onClick={requestCancel}>
                Cancel
              </Button>
              <Button variant="secondary" icon={<Landmark size={16} strokeWidth={2.2} />} onClick={() => saveWorkspaceOrder('draft')}>
                Save Draft
              </Button>
              {activeStep === 'review' ? (
                <Button
                  variant="primary"
                  icon={<Warehouse size={16} strokeWidth={2.2} />}
                  loading={creating}
                  disabled={!allValid}
                  onClick={handleCreate}
                >
                  Create Order
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} strokeWidth={2.2} />}
                  iconPosition="right"
                  disabled={!canMoveNext}
                  onClick={() => setActiveStep(STEPS[activeIndex + 1].key)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,24,40,0.40)] p-6">
          <GlassCard className="w-full max-w-[460px] p-5 shadow-[0_12px_32px_-8px_rgba(16,24,40,0.24)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-section-title">Unsaved changes detected.</div>
                <div className="mt-2 text-subtitle">Save the draft or stay on this workflow.</div>
              </div>
              <Button variant="icon" size="sm" aria-label="Close dialog" icon={<X size={15} strokeWidth={2.4} />} onClick={() => setShowLeaveDialog(false)} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => navigate('/orders')}>Leave</Button>
              <Button variant="secondary" onClick={() => setShowLeaveDialog(false)}>Stay</Button>
              <Button variant="primary" icon={<Landmark size={16} strokeWidth={2.2} />} onClick={() => saveWorkspaceOrder('draft')}>Save Draft</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}

