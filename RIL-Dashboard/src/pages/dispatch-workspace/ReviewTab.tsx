import { ClipboardCheck, Pencil } from 'lucide-react';

import Button from '../../components/ui/Button';
import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import { formatValue } from '../../lib/orderFilters';
import type { Order } from '../../lib/types/order';
import { SummaryRow } from '../create-order/CreateOrderRows';
import { REQUIRED_DOCUMENTS, STEP_COPY } from './constants';
import { liveEta } from './utils';
import type { ShipmentType, SpecialHandling, StepKey, TransportMode } from './types';

interface ReviewTabProps {
  allValid: boolean;
  order?: Order;
  carrier: string;
  dispatchDate: string;
  expectedArrival: string;
  shipmentType: ShipmentType;
  packages: string;
  weight: string;
  packageDescription: string;
  specialHandling: SpecialHandling;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  licenseNumber: string;
  lrNumber: string;
  trackingNumber: string;
  transportMode: TransportMode;
  documents: Record<string, boolean>;
  setActiveStep: (step: StepKey) => void;
}

export default function ReviewTab({
  allValid,
  order,
  carrier,
  dispatchDate,
  expectedArrival,
  shipmentType,
  packages,
  weight,
  packageDescription,
  specialHandling,
  vehicleNumber,
  driverName,
  driverContact,
  licenseNumber,
  lrNumber,
  trackingNumber,
  transportMode,
  documents,
  setActiveStep,
}: ReviewTabProps) {
  return (
    <GlassCard key="review" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={ClipboardCheck} {...STEP_COPY.review} pill={allValid ? 'READY' : 'PENDING'} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-section-title">Order Information</div>
            <Button variant="icon" size="sm" aria-label="Edit order selection" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('order')} />
          </div>
          <SummaryRow label="Order" value={order?.id ?? ''} />
          <SummaryRow label="PO Number" value={order?.po ?? ''} />
          <SummaryRow label="Vendor" value={order?.vendor ?? ''} />
          <SummaryRow label="Plant" value={order?.plant ?? ''} />
          <SummaryRow label="Contract Type" value={order?.type ?? ''} />
          <SummaryRow label="Order Value" value={order ? formatValue(order.valueCr) : ''} />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-section-title">Dispatch Information</div>
            <Button variant="icon" size="sm" aria-label="Edit dispatch details" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('shipment')} />
          </div>
          <SummaryRow label="Carrier" value={carrier} />
          <SummaryRow label="Shipment Type" value={shipmentType} />
          <SummaryRow label="Dispatch Date" value={dispatchDate} />
          <SummaryRow label="Expected Arrival" value={expectedArrival} />
          <SummaryRow label="Packages" value={packages} />
          <SummaryRow label="Weight" value={weight} />
          <SummaryRow label="Description" value={packageDescription} />
          <SummaryRow label="Special Handling" value={specialHandling} />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-section-title">Vehicle Information</div>
            <Button variant="icon" size="sm" aria-label="Edit vehicle details" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('vehicle')} />
          </div>
          <SummaryRow label="Vehicle Number" value={vehicleNumber} />
          <SummaryRow label="Driver" value={driverName} />
          <SummaryRow label="Driver Contact" value={driverContact} />
          <SummaryRow label="License Number" value={licenseNumber} />
          <SummaryRow label="LR Number" value={lrNumber} />
          <SummaryRow label="Tracking Number" value={trackingNumber} />
          <SummaryRow label="Transport Mode" value={transportMode} />
          <SummaryRow label="Live ETA" value={liveEta(expectedArrival)} />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-section-title">Uploaded Documents</div>
            <Button variant="icon" size="sm" aria-label="Edit documents" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('documents')} />
          </div>
          {REQUIRED_DOCUMENTS.map((document) => (
            <SummaryRow key={document} label={document} value={documents[document] ? 'Uploaded' : ''} />
          ))}
        </GlassCard>
      </div>
    </GlassCard>
  );
}
