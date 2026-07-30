import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, Landmark, Truck, X } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import StepNavigation from '../components/ui/StepNavigation';
import Toast from '../components/ui/Toast';
import { getOrders } from '../lib/orderStore';
import { matchesSearch } from '../lib/orderFilters';
import type { Order } from '../lib/types/order';
import DispatchDetailsTab from './dispatch-workspace/DispatchDetailsTab';
import DispatchWorkspaceSidebar from './dispatch-workspace/DispatchWorkspaceSidebar';
import DocumentsTab from './dispatch-workspace/DocumentsTab';
import OrderSelectionTab from './dispatch-workspace/OrderSelectionTab';
import ReviewTab from './dispatch-workspace/ReviewTab';
import VehicleTab from './dispatch-workspace/VehicleTab';
import { REQUIRED_DOCUMENTS, STEPS, STEP_COPY } from './dispatch-workspace/constants';
import { required, shipmentIdFor } from './dispatch-workspace/utils';
import type {
  DraftState,
  FieldKey,
  ShipmentType,
  SpecialHandling,
  StepKey,
  TransportMode,
} from './dispatch-workspace/types';

export default function DispatchWorkspace() {
  const navigate = useNavigate();
  const announcedCompletion = useRef<Partial<Record<StepKey, boolean>>>({});
  const [activeStep, setActiveStep] = useState<StepKey>('order');
  const [orderQuery, setOrderQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [expectedArrival, setExpectedArrival] = useState('');
  const [shipmentType, setShipmentType] = useState<ShipmentType>('Full Truck Load');
  const [packages, setPackages] = useState('');
  const [weight, setWeight] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [specialHandling, setSpecialHandling] = useState<SpecialHandling>('None');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('Road');
  const [documents, setDocuments] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REQUIRED_DOCUMENTS.map((document) => [document, false])),
  );
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const orders = useMemo(() => getOrders(), []);
  const searchedOrders = useMemo(() => orders.filter((order) => matchesSearch(order, orderQuery)), [orders, orderQuery]);
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId), [orders, selectedOrderId]);
  const shipmentId = selectedOrder ? shipmentIdFor(selectedOrder.id) : '';
  const uploadedCount = REQUIRED_DOCUMENTS.filter((document) => documents[document]).length;

  const orderValid = Boolean(selectedOrder);
  const shipmentValid = required(carrier) && required(dispatchDate) && required(expectedArrival)
    && required(shipmentType) && required(packages) && required(weight);
  const vehicleValid = required(vehicleNumber) && required(driverName) && required(driverContact)
    && required(licenseNumber) && required(lrNumber) && required(trackingNumber) && required(transportMode);
  const documentsValid = REQUIRED_DOCUMENTS.every((document) => documents[document]);
  const allValid = orderValid && shipmentValid && vehicleValid && documentsValid;

  const completed = useMemo<Record<StepKey, boolean>>(
    () => ({
      order: orderValid,
      shipment: shipmentValid,
      vehicle: vehicleValid,
      documents: documentsValid,
      review: allValid,
    }),
    [allValid, documentsValid, orderValid, shipmentValid, vehicleValid],
  );

  const highestUnlockedIndex = useMemo(() => {
    let index = 0;
    if (orderValid) index = 1;
    if (orderValid && shipmentValid) index = 2;
    if (orderValid && shipmentValid && vehicleValid) index = 3;
    if (orderValid && shipmentValid && vehicleValid && documentsValid) index = 4;
    return index;
  }, [documentsValid, orderValid, shipmentValid, vehicleValid]);

  const activeIndex = STEPS.findIndex((step) => step.key === activeStep);
  const completedCount = [orderValid, shipmentValid, vehicleValid, documentsValid, allValid].filter(Boolean).length;
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
  }, [draftState, selectedOrderId, carrier, dispatchDate, expectedArrival, shipmentType, packages, weight, packageDescription, specialHandling, vehicleNumber, driverName, driverContact, licenseNumber, lrNumber, trackingNumber, transportMode, documents]);

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

  const shipmentChecks = useMemo(
    () => [
      { label: 'Carrier', done: required(carrier), touched: touched.carrier },
      { label: 'Dispatch Date', done: required(dispatchDate), touched: touched.dispatchDate },
      { label: 'Expected Arrival', done: required(expectedArrival), touched: touched.expectedArrival },
      { label: 'Shipment Type', done: required(shipmentType), touched: touched.shipmentType },
      { label: 'Number of Packages', done: required(packages), touched: touched.packages },
      { label: 'Weight', done: required(weight), touched: touched.weight },
    ],
    [carrier, dispatchDate, expectedArrival, packages, shipmentType, touched, weight],
  );

  const vehicleChecks = useMemo(
    () => [
      { label: 'Vehicle Number', done: required(vehicleNumber), touched: touched.vehicleNumber },
      { label: 'Driver Name', done: required(driverName), touched: touched.driverName },
      { label: 'Driver Contact', done: required(driverContact), touched: touched.driverContact },
      { label: 'License Number', done: required(licenseNumber), touched: touched.licenseNumber },
      { label: 'LR Number', done: required(lrNumber), touched: touched.lrNumber },
      { label: 'Tracking Number', done: required(trackingNumber), touched: touched.trackingNumber },
      { label: 'Transport Mode', done: required(transportMode), touched: touched.transportMode },
    ],
    [driverContact, driverName, licenseNumber, lrNumber, touched, trackingNumber, transportMode, vehicleNumber],
  );

  const activeValidation = useMemo(() => {
    if (activeStep === 'order') {
      return [
        { label: 'Order selected', done: orderValid, waiting: !orderValid },
        { label: 'Vendor confirmed', done: Boolean(selectedOrder?.vendor), waiting: !selectedOrder },
        { label: 'Destination plant', done: Boolean(selectedOrder?.plant), waiting: !selectedOrder },
      ];
    }
    if (activeStep === 'shipment') return shipmentChecks.map((item) => ({ ...item, waiting: !item.touched && !item.done }));
    if (activeStep === 'vehicle') return vehicleChecks.map((item) => ({ ...item, waiting: !item.touched && !item.done }));
    if (activeStep === 'documents') {
      return REQUIRED_DOCUMENTS.map((document) => ({ label: document, done: documents[document], waiting: !documents[document] }));
    }
    return [
      { label: 'Order selected', done: orderValid, waiting: false },
      { label: 'Carrier added', done: required(carrier), waiting: false },
      { label: 'Vehicle added', done: required(vehicleNumber), waiting: false },
      { label: 'Tracking number', done: required(trackingNumber), waiting: false },
      { label: 'Documents uploaded', done: documentsValid, waiting: false },
      { label: 'Review completed', done: allValid, waiting: false },
    ];
  }, [activeStep, allValid, carrier, documents, documentsValid, orderValid, selectedOrder, shipmentChecks, trackingNumber, vehicleChecks, vehicleNumber]);

  const goToStep = (step: StepKey) => {
    const index = STEPS.findIndex((item) => item.key === step);
    if (index <= highestUnlockedIndex) setActiveStep(step);
  };

  const selectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    meaningfulChange();
  };

  const saveDraft = () => {
    setIsDirty(false);
    setDraftState('saved');
    setToast(shipmentId ? `Saved ${shipmentId} as draft.` : 'Saved dispatch draft.');
  };

  const requestCancel = () => {
    if (isDirty || draftState === 'saving') {
      setShowLeaveDialog(true);
      return;
    }
    navigate('/orders');
  };

  const handleSubmit = () => {
    if (!allValid) return;
    setSubmitting(true);
    setToast('Dispatching order...');
    window.setTimeout(() => {
      setIsDirty(false);
      navigate('/orders', {
        state: { toast: `Dispatched ${shipmentId} against ${selectedOrder?.id}.` },
      });
    }, 900);
  };

  const renderActiveTab = () => {
    if (activeStep === 'order') {
      return (
        <OrderSelectionTab
          query={orderQuery}
          setQuery={setOrderQuery}
          orders={searchedOrders}
          selectedOrderId={selectedOrderId}
          onSelect={selectOrder}
        />
      );
    }

    if (activeStep === 'shipment') {
      return (
        <DispatchDetailsTab
          carrier={carrier}
          dispatchDate={dispatchDate}
          expectedArrival={expectedArrival}
          shipmentType={shipmentType}
          packages={packages}
          weight={weight}
          packageDescription={packageDescription}
          specialHandling={specialHandling}
          touched={touched}
          setField={setField}
          setSelectField={setSelectField}
          setCarrier={setCarrier}
          setDispatchDate={setDispatchDate}
          setExpectedArrival={setExpectedArrival}
          setShipmentType={setShipmentType}
          setPackages={setPackages}
          setWeight={setWeight}
          setPackageDescription={setPackageDescription}
          setSpecialHandling={setSpecialHandling}
          meaningfulChange={meaningfulChange}
        />
      );
    }

    if (activeStep === 'vehicle') {
      return (
        <VehicleTab
          vehicleNumber={vehicleNumber}
          driverName={driverName}
          driverContact={driverContact}
          licenseNumber={licenseNumber}
          lrNumber={lrNumber}
          trackingNumber={trackingNumber}
          transportMode={transportMode}
          expectedArrival={expectedArrival}
          touched={touched}
          setField={setField}
          setSelectField={setSelectField}
          setVehicleNumber={setVehicleNumber}
          setDriverName={setDriverName}
          setDriverContact={setDriverContact}
          setLicenseNumber={setLicenseNumber}
          setLrNumber={setLrNumber}
          setTrackingNumber={setTrackingNumber}
          setTransportMode={setTransportMode}
        />
      );
    }

    if (activeStep === 'documents') {
      return <DocumentsTab documents={documents} setDocuments={setDocuments} meaningfulChange={meaningfulChange} />;
    }

    return (
      <ReviewTab
        allValid={allValid}
        order={selectedOrder}
        carrier={carrier}
        dispatchDate={dispatchDate}
        expectedArrival={expectedArrival}
        shipmentType={shipmentType}
        packages={packages}
        weight={weight}
        packageDescription={packageDescription}
        specialHandling={specialHandling}
        vehicleNumber={vehicleNumber}
        driverName={driverName}
        driverContact={driverContact}
        licenseNumber={licenseNumber}
        lrNumber={lrNumber}
        trackingNumber={trackingNumber}
        transportMode={transportMode}
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
            title="Dispatch Workspace"
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
          title="Dispatch Readiness"
          description={`Capture logistics, transport and documents before execution begins. ${completedCount} of ${STEPS.length} steps completed.`}
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
          <div className="min-w-0">{renderActiveTab()}</div>
          <DispatchWorkspaceSidebar
            activeStep={activeStep}
            completed={completed}
            activeValidation={activeValidation}
            order={selectedOrder}
            carrier={carrier}
            dispatchDate={dispatchDate}
            expectedArrival={expectedArrival}
            shipmentType={shipmentType}
            packages={packages}
            weight={weight}
            vehicleNumber={vehicleNumber}
            driverName={driverName}
            driverContact={driverContact}
            lrNumber={lrNumber}
            trackingNumber={trackingNumber}
            transportMode={transportMode}
            uploadedCount={uploadedCount}
            documents={documents}
            shipmentId={shipmentId}
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
              <Button variant="secondary" icon={<Landmark size={16} strokeWidth={2.2} />} onClick={saveDraft}>
                Save Draft
              </Button>
              {activeStep === 'review' ? (
                <Button
                  variant="primary"
                  icon={<Truck size={16} strokeWidth={2.2} />}
                  loading={submitting}
                  disabled={!allValid}
                  onClick={handleSubmit}
                >
                  Dispatch Order
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
              <Button
                variant="primary"
                icon={<Landmark size={16} strokeWidth={2.2} />}
                onClick={() => {
                  saveDraft();
                  setShowLeaveDialog(false);
                }}
              >
                Save Draft
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
