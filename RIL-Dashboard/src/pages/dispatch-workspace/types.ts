export type StepKey = 'order' | 'shipment' | 'vehicle' | 'documents' | 'review';
export type DraftState = 'idle' | 'saving' | 'saved';
export type ShipmentType = 'Full Truck Load' | 'Part Truck Load' | 'Container' | 'Air Freight';
export type SpecialHandling = 'None' | 'Fragile' | 'Hazardous' | 'Temperature Controlled' | 'Oversized';
export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Sea';

export type FieldKey =
  | 'carrier'
  | 'dispatchDate'
  | 'expectedArrival'
  | 'shipmentType'
  | 'specialHandling'
  | 'packages'
  | 'weight'
  | 'vehicleNumber'
  | 'driverName'
  | 'driverContact'
  | 'licenseNumber'
  | 'lrNumber'
  | 'trackingNumber'
  | 'transportMode';

export interface StepConfig {
  key: StepKey;
  label: string;
}

export interface TimelineStage {
  key: string;
  label: string;
}
