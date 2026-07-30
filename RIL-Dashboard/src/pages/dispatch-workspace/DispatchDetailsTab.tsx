import { Boxes, CalendarDays, PackageCheck, Scale, Truck } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { CARRIER_OPTIONS, SHIPMENT_TYPE_OPTIONS, SPECIAL_HANDLING_OPTIONS, STEP_COPY } from './constants';
import { required } from './utils';
import type { FieldKey, ShipmentType, SpecialHandling } from './types';

interface DispatchDetailsTabProps {
  carrier: string;
  dispatchDate: string;
  expectedArrival: string;
  shipmentType: ShipmentType;
  packages: string;
  weight: string;
  packageDescription: string;
  specialHandling: SpecialHandling;
  touched: Partial<Record<FieldKey, boolean>>;
  setField: (field: FieldKey, setter: (value: string) => void) => (value: string) => void;
  setSelectField: <T extends string>(field: FieldKey, setter: (value: T) => void) => (value: T) => void;
  setCarrier: (value: string) => void;
  setDispatchDate: (value: string) => void;
  setExpectedArrival: (value: string) => void;
  setShipmentType: (value: ShipmentType) => void;
  setPackages: (value: string) => void;
  setWeight: (value: string) => void;
  setPackageDescription: (value: string) => void;
  setSpecialHandling: (value: SpecialHandling) => void;
  meaningfulChange: () => void;
}

export default function DispatchDetailsTab({
  carrier,
  dispatchDate,
  expectedArrival,
  shipmentType,
  packages,
  weight,
  packageDescription,
  specialHandling,
  touched,
  setField,
  setSelectField,
  setCarrier,
  setDispatchDate,
  setExpectedArrival,
  setShipmentType,
  setPackages,
  setWeight,
  setPackageDescription,
  setSpecialHandling,
  meaningfulChange,
}: DispatchDetailsTabProps) {
  return (
    <GlassCard key="shipment" bloom="cyan" className="animate-rise p-7" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={Truck} {...STEP_COPY.shipment} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2.5 block text-body-strong">Carrier</label>
          <Select value={carrier} onChange={setField('carrier', setCarrier)} options={CARRIER_OPTIONS} ariaLabel="Carrier" className="w-full" />
        </div>
        <div>
          <label className="mb-2.5 block text-body-strong">Shipment Type</label>
          <Select value={shipmentType} onChange={setSelectField('shipmentType', setShipmentType)} options={SHIPMENT_TYPE_OPTIONS} ariaLabel="Shipment type" className="w-full" />
        </div>
        <TextField label="Dispatch Date" value={dispatchDate} onChange={setField('dispatchDate', setDispatchDate)} error={touched.dispatchDate && !required(dispatchDate) ? 'Required' : false} type="date" leadingIcon={<CalendarDays size={17} strokeWidth={2.2} />} />
        <TextField label="Expected Arrival" value={expectedArrival} onChange={setField('expectedArrival', setExpectedArrival)} error={touched.expectedArrival && !required(expectedArrival) ? 'Required' : false} type="date" leadingIcon={<CalendarDays size={17} strokeWidth={2.2} />} />
        <TextField label="Number of Packages" value={packages} onChange={setField('packages', setPackages)} error={touched.packages && !required(packages) ? 'Required' : false} placeholder="24" leadingIcon={<Boxes size={17} strokeWidth={2.2} />} />
        <TextField label="Weight" value={weight} onChange={setField('weight', setWeight)} error={touched.weight && !required(weight) ? 'Required' : false} placeholder="12.4 MT" leadingIcon={<Scale size={17} strokeWidth={2.2} />} />
        <TextField label="Package Description" value={packageDescription} onChange={(value) => { setPackageDescription(value); meaningfulChange(); }} placeholder="Crated pump assemblies" leadingIcon={<PackageCheck size={17} strokeWidth={2.2} />} />
        <div>
          <label className="mb-2.5 block text-body-strong">Special Handling</label>
          <Select value={specialHandling} onChange={setSelectField('specialHandling', setSpecialHandling)} options={SPECIAL_HANDLING_OPTIONS} ariaLabel="Special handling" className="w-full" />
        </div>
      </div>
    </GlassCard>
  );
}
