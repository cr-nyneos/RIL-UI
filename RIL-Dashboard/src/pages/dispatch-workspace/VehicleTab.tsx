import { BadgeCheck, IdCard, MapPin, Phone, Radar, Route, ScrollText, UserRound } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { STEP_COPY, TRANSPORT_MODE_OPTIONS } from './constants';
import { liveEta, required } from './utils';
import type { FieldKey, TransportMode } from './types';

interface VehicleTabProps {
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  licenseNumber: string;
  lrNumber: string;
  trackingNumber: string;
  transportMode: TransportMode;
  expectedArrival: string;
  touched: Partial<Record<FieldKey, boolean>>;
  setField: (field: FieldKey, setter: (value: string) => void) => (value: string) => void;
  setSelectField: <T extends string>(field: FieldKey, setter: (value: T) => void) => (value: T) => void;
  setVehicleNumber: (value: string) => void;
  setDriverName: (value: string) => void;
  setDriverContact: (value: string) => void;
  setLicenseNumber: (value: string) => void;
  setLrNumber: (value: string) => void;
  setTrackingNumber: (value: string) => void;
  setTransportMode: (value: TransportMode) => void;
}

export default function VehicleTab({
  vehicleNumber,
  driverName,
  driverContact,
  licenseNumber,
  lrNumber,
  trackingNumber,
  transportMode,
  expectedArrival,
  touched,
  setField,
  setSelectField,
  setVehicleNumber,
  setDriverName,
  setDriverContact,
  setLicenseNumber,
  setLrNumber,
  setTrackingNumber,
  setTransportMode,
}: VehicleTabProps) {
  const eta = liveEta(expectedArrival);

  return (
    <GlassCard key="vehicle" bloom="violet" className="animate-rise p-7" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={Route} {...STEP_COPY.vehicle} pill={transportMode} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextField label="Vehicle Number" value={vehicleNumber} onChange={setField('vehicleNumber', setVehicleNumber)} error={touched.vehicleNumber && !required(vehicleNumber) ? 'Required' : false} placeholder="GJ-01-KA-4472" leadingIcon={<Radar size={17} strokeWidth={2.2} />} />
        <TextField label="Driver Name" value={driverName} onChange={setField('driverName', setDriverName)} error={touched.driverName && !required(driverName) ? 'Required' : false} placeholder="Ramesh Patel" leadingIcon={<UserRound size={17} strokeWidth={2.2} />} />
        <TextField label="Driver Contact" value={driverContact} onChange={setField('driverContact', setDriverContact)} error={touched.driverContact && !required(driverContact) ? 'Required' : false} placeholder="+91 98250 44120" leadingIcon={<Phone size={17} strokeWidth={2.2} />} />
        <TextField label="License Number" value={licenseNumber} onChange={setField('licenseNumber', setLicenseNumber)} error={touched.licenseNumber && !required(licenseNumber) ? 'Required' : false} placeholder="GJ0120220004472" leadingIcon={<IdCard size={17} strokeWidth={2.2} />} />
        <TextField label="LR Number" value={lrNumber} onChange={setField('lrNumber', setLrNumber)} error={touched.lrNumber && !required(lrNumber) ? 'Required' : false} placeholder="LR-88213-04" leadingIcon={<ScrollText size={17} strokeWidth={2.2} />} />
        <TextField label="Tracking Number" value={trackingNumber} onChange={setField('trackingNumber', setTrackingNumber)} error={touched.trackingNumber && !required(trackingNumber) ? 'Required' : false} placeholder="TRK-4471209835" leadingIcon={<BadgeCheck size={17} strokeWidth={2.2} />} />
        <div>
          <label className="mb-2.5 block text-body-strong">Transport Mode</label>
          <Select value={transportMode} onChange={setSelectField('transportMode', setTransportMode)} options={TRANSPORT_MODE_OPTIONS} ariaLabel="Transport mode" className="w-full" />
        </div>
        <div>
          <label className="mb-2.5 block text-body-strong">Live ETA</label>
          <div className="glass-inset flex h-11 items-center gap-3 px-4">
            <MapPin size={17} strokeWidth={2.2} className="flex-none text-brand-700" />
            <span className="truncate text-body-strong tabular-nums">{eta || 'Awaiting expected arrival'}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
