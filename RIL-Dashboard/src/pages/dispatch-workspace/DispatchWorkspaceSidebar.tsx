import {
  CalendarDays,
  CloudUpload,
  FileCheck2,
  FileText,
  Gauge,
  MapPin,
  PackageCheck,
  Radar,
  Route,
  ShieldCheck,
  Truck,
  UserRoundCheck,
} from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import StageRail from '../../components/ui/StageRail';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatExpected, formatValue, getOrderBucket } from '../../lib/orderFilters';
import type { Order } from '../../lib/types/order';
import { CheckRow, SummaryRow } from '../create-order/CreateOrderRows';
import DispatchTimeline from './DispatchTimeline';
import { REQUIRED_DOCUMENTS } from './constants';
import { liveEta, transitDays } from './utils';
import type { ShipmentType, StepKey, TransportMode } from './types';

interface ValidationItem {
  label: string;
  done: boolean;
  waiting?: boolean;
}

interface DispatchWorkspaceSidebarProps {
  activeStep: StepKey;
  completed: Record<StepKey, boolean>;
  activeValidation: ValidationItem[];
  order?: Order;
  carrier: string;
  dispatchDate: string;
  expectedArrival: string;
  shipmentType: ShipmentType;
  packages: string;
  weight: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  lrNumber: string;
  trackingNumber: string;
  transportMode: TransportMode;
  uploadedCount: number;
  documents: Record<string, boolean>;
  shipmentId: string;
}

export default function DispatchWorkspaceSidebar({
  activeStep,
  completed,
  activeValidation,
  order,
  carrier,
  dispatchDate,
  expectedArrival,
  shipmentType,
  packages,
  weight,
  vehicleNumber,
  driverName,
  driverContact,
  lrNumber,
  trackingNumber,
  transportMode,
  uploadedCount,
  documents,
  shipmentId,
}: DispatchWorkspaceSidebarProps) {
  const expected = order ? formatExpected(order.expected, order.progress >= 100) : undefined;

  return (
    <aside className="animate-panel-right space-y-4 xl:sticky xl:top-8">
      {activeStep === 'order' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Order" icon={PackageCheck} title="Order Summary" subtitle="Order this dispatch travels against." pill={order?.id} />
            <SummaryRow label="PO Number" value={order?.po ?? ''} />
            <SummaryRow label="Vendor" value={order?.vendor ?? ''} />
            <SummaryRow label="Plant" value={order?.plant ?? ''} />
            <SummaryRow label="Contract Type" value={order?.type ?? ''} />
            <SummaryRow label="Expected Delivery" value={expected?.label ?? ''} />
            <SummaryRow label="Order Value" value={order ? formatValue(order.valueCr) : ''} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Status" icon={ShieldCheck} title="Current Status" subtitle="Gate position before dispatch." />
            {order ? (
              <div className="space-y-4">
                <StatusBadge status={order.status} />
                <StageRail stages={order.gates} compact={false} blocked={getOrderBucket(order) === 'blocked'} />
              </div>
            ) : (
              <SummaryRow label="Order" value="" />
            )}
          </GlassCard>
        </>
      )}

      {activeStep === 'shipment' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Dispatch" icon={Truck} title="Dispatch Summary" subtitle="Live dispatch profile." />
            <SummaryRow label="Carrier" value={carrier} />
            <SummaryRow label="Shipment Type" value={shipmentType} />
            <SummaryRow label="Packages" value={packages} />
            <SummaryRow label="Weight" value={weight} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Schedule" icon={CalendarDays} title="Delivery Timeline" subtitle="Dispatch to plant arrival." />
            <SummaryRow label="Dispatch" value={dispatchDate} />
            <SummaryRow label="Expected Arrival" value={expectedArrival} />
            <SummaryRow label="Transit" value={transitDays(dispatchDate, expectedArrival)} />
          </GlassCard>
        </>
      )}

      {activeStep === 'vehicle' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Vehicle" icon={Radar} title="Vehicle Card" subtitle="Live vehicle and driver record." pill={transportMode} />
            <SummaryRow label="Vehicle Number" value={vehicleNumber} />
            <SummaryRow label="Driver" value={driverName} />
            <SummaryRow label="Driver Contact" value={driverContact} />
            <SummaryRow label="LR Number" value={lrNumber} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Tracking" icon={MapPin} title="Tracking Preview" subtitle="Carrier ETA against this route." />
            <SummaryRow label="Tracking Number" value={trackingNumber} />
            <SummaryRow label="Carrier" value={carrier} />
            <SummaryRow label="Live ETA" value={liveEta(expectedArrival)} />
            <SummaryRow label="Destination" value={order?.plant ?? ''} />
          </GlassCard>
        </>
      )}

      {activeStep === 'documents' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Files" icon={CloudUpload} title="Uploaded Documents" subtitle="Files attached to this dispatch." />
            <SummaryRow label="Uploaded" value={`${uploadedCount} of ${REQUIRED_DOCUMENTS.length}`} />
            {REQUIRED_DOCUMENTS.map((document) => (
              <CheckRow key={document} label={document} done={documents[document]} waiting={!documents[document]} />
            ))}
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Documents" icon={FileCheck2} title="Required Documents" subtitle="Mandatory dispatch package." />
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((document) => (
                <div key={document} className="glass-inset flex items-center gap-3 p-3">
                  <FileText size={17} strokeWidth={2.2} className="text-brand-700" />
                  <span className="text-body-strong">{document}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}

      {activeStep === 'review' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Complete" icon={PackageCheck} title="Final Dispatch Summary" subtitle="Dispatch readiness." pill={shipmentId} />
            <SummaryRow label="Order" value={order?.id ?? ''} />
            <SummaryRow label="Carrier" value={carrier} />
            <SummaryRow label="Vehicle" value={vehicleNumber} />
            <SummaryRow label="Tracking" value={trackingNumber} />
            <SummaryRow label="Documents" value={`${uploadedCount} of ${REQUIRED_DOCUMENTS.length}`} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Route" icon={Route} title="Dispatch Timeline" subtitle="Dispatch is the active milestone." />
            <DispatchTimeline />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '200ms' }}>
            <CardHeader eyebrow="Schedule" icon={Gauge} title="Delivery Schedule" subtitle="Planned arrival at destination plant." />
            <SummaryRow label="Dispatch" value={dispatchDate} />
            <SummaryRow label="Expected Arrival" value={expectedArrival} />
            <SummaryRow label="Transit" value={transitDays(dispatchDate, expectedArrival)} />
            <SummaryRow label="Destination" value={order?.plant ?? ''} />
          </GlassCard>
        </>
      )}

      <GlassCard className="animate-rise p-5" style={{ animationDelay: '240ms' }}>
        <CardHeader
          eyebrow="Checks"
          icon={UserRoundCheck}
          title={activeStep === 'review' ? 'Final Validation' : 'Validation'}
          subtitle="Step readiness checklist."
          pill={completed[activeStep] ? 'READY' : 'PENDING'}
        />
        <div className="space-y-3">
          {activeValidation.map((item) => (
            <CheckRow key={item.label} label={item.label} done={item.done} waiting={item.waiting} />
          ))}
        </div>
      </GlassCard>
    </aside>
  );
}
