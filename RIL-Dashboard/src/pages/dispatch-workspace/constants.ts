import type {
  ShipmentType,
  SpecialHandling,
  StepConfig,
  StepKey,
  TimelineStage,
  TransportMode,
} from './types';

export const STEPS: StepConfig[] = [
  { key: 'order', label: 'Order' },
  { key: 'shipment', label: 'Dispatch' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
];

export const CARRIER_OPTIONS = [
  { value: '', label: 'Select carrier' },
  { value: 'Blue Dart', label: 'Blue Dart' },
  { value: 'Safexpress', label: 'Safexpress' },
  { value: 'VRL Logistics', label: 'VRL Logistics' },
  { value: 'Gati', label: 'Gati' },
  { value: 'TCI Express', label: 'TCI Express' },
  { value: 'Delhivery', label: 'Delhivery' },
];

export const SHIPMENT_TYPE_OPTIONS: Array<{ value: ShipmentType; label: ShipmentType }> = [
  { value: 'Full Truck Load', label: 'Full Truck Load' },
  { value: 'Part Truck Load', label: 'Part Truck Load' },
  { value: 'Container', label: 'Container' },
  { value: 'Air Freight', label: 'Air Freight' },
];

export const SPECIAL_HANDLING_OPTIONS: Array<{ value: SpecialHandling; label: SpecialHandling }> = [
  { value: 'None', label: 'None' },
  { value: 'Fragile', label: 'Fragile' },
  { value: 'Hazardous', label: 'Hazardous' },
  { value: 'Temperature Controlled', label: 'Temperature Controlled' },
  { value: 'Oversized', label: 'Oversized' },
];

export const TRANSPORT_MODE_OPTIONS: Array<{ value: TransportMode; label: TransportMode }> = [
  { value: 'Road', label: 'Road' },
  { value: 'Rail', label: 'Rail' },
  { value: 'Air', label: 'Air' },
  { value: 'Sea', label: 'Sea' },
];

export const REQUIRED_DOCUMENTS = [
  'Packing List',
  'Invoice',
  'E-way Bill',
  'Transport Receipt',
  'Material Certificates',
  'Inspection Certificates',
];

export const ORDER_TIMELINE: TimelineStage[] = [
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'dispatch', label: 'Dispatch' },
  { key: 'transit', label: 'Transit' },
  { key: 'gate-in', label: 'Gate In' },
  { key: 'qc', label: 'QC' },
  { key: 'delivery', label: 'Delivery' },
];

export const ACTIVE_MILESTONE = 'dispatch';

export const STEP_COPY: Record<StepKey, { eyebrow: string; title: string; subtitle: string }> = {
  order: {
    eyebrow: 'Order',
    title: 'Order Selection',
    subtitle: '',
  },
  shipment: {
    eyebrow: 'Dispatch',
    title: 'Dispatch Details',
    subtitle: '',
  },
  vehicle: {
    eyebrow: 'Logistics',
    title: 'Vehicle & Logistics',
    subtitle: '',
  },
  documents: {
    eyebrow: 'Files',
    title: 'Dispatch Documents',
    subtitle: '',
  },
  review: {
    eyebrow: 'Review',
    title: 'Final Dispatch Review',
    subtitle: '',
  },
};
