import { FileCheck2, FileText, IndianRupee, ClipboardList } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import DatePicker from '../../components/ui/DatePicker';
import GlassCard from '../../components/ui/GlassCard';
import InsightCard from '../../components/ui/InsightCard';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { CONTRACT_OPTIONS, PLANT_OPTIONS, PRIORITY_OPTIONS, STEP_COPY, VENDOR_OPTIONS } from './constants';
import { getPlantInsight, getVendorInsight } from './predictiveInsights';
import type { PredictiveInsight } from './predictiveInsights';
import { required } from './utils';
import type { FieldKey, Priority } from './types';
import type { ContractType } from '../../lib/types/order';

interface DetailsTabProps {
  vendor: string;
  plant: string;
  contractType: ContractType;
  priority: Priority;
  poNumber: string;
  contractNumber: string;
  orderValue: string;
  completionDate: string;
  description: string;
  touched: Partial<Record<FieldKey, boolean>>;
  setField: (field: FieldKey, setter: (value: string) => void) => (value: string) => void;
  setSelectField: <T extends string>(field: FieldKey, setter: (value: T) => void) => (value: T) => void;
  setVendor: (value: string) => void;
  setPlant: (value: string) => void;
  setContractType: (value: ContractType) => void;
  setPriority: (value: Priority) => void;
  setPoNumber: (value: string) => void;
  setContractNumber: (value: string) => void;
  setOrderValue: (value: string) => void;
  setCompletionDate: (value: string) => void;
  setDescription: (value: string) => void;
  meaningfulChange: () => void;
  dismissedInsightKeys: string[];
  dismissInsight: (key: string) => void;
}

export default function DetailsTab({
  vendor,
  plant,
  contractType,
  priority,
  poNumber,
  contractNumber,
  orderValue,
  completionDate,
  description,
  touched,
  setField,
  setSelectField,
  setVendor,
  setPlant,
  setContractType,
  setPriority,
  setPoNumber,
  setContractNumber,
  setOrderValue,
  setCompletionDate,
  setDescription,
  meaningfulChange,
  dismissedInsightKeys,
  dismissInsight,
}: DetailsTabProps) {
  const insights = [getVendorInsight(vendor), getPlantInsight(plant)].filter(
    (item): item is PredictiveInsight => Boolean(item) && !dismissedInsightKeys.includes(item!.key),
  );

  return (
    <GlassCard key="details" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={ClipboardList} {...STEP_COPY.details} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2.5 block text-body-strong">Vendor</label>
          <Select value={vendor} onChange={setField('vendor', setVendor)} options={VENDOR_OPTIONS} ariaLabel="Vendor" className="w-full" />
        </div>
        <div>
          <label className="mb-2.5 block text-body-strong">Plant</label>
          <Select value={plant} onChange={setField('plant', setPlant)} options={PLANT_OPTIONS} ariaLabel="Plant" className="w-full" />
        </div>
        {insights.map((item) => (
          <InsightCard
            key={item.key}
            title={item.title}
            body={item.body}
            onDismiss={() => dismissInsight(item.key)}
            className="lg:col-span-2"
          />
        ))}
        <div>
          <label className="mb-2.5 block text-body-strong">Contract Type</label>
          <Select value={contractType} onChange={setSelectField('contractType', setContractType)} options={CONTRACT_OPTIONS} ariaLabel="Contract type" className="w-full" />
        </div>
        <div>
          <label className="mb-2.5 block text-body-strong">Priority</label>
          <Select value={priority} onChange={setSelectField('priority', setPriority)} options={PRIORITY_OPTIONS} ariaLabel="Priority" className="w-full" />
        </div>
        <TextField label="PO Number" value={poNumber} onChange={setField('poNumber', setPoNumber)} error={touched.poNumber && !required(poNumber) ? 'Required' : false} placeholder="PO-RIL-88342" leadingIcon={<FileText size={17} strokeWidth={2.2} />} />
        <TextField label="Contract Number" value={contractNumber} onChange={setField('contractNumber', setContractNumber)} error={touched.contractNumber && !required(contractNumber) ? 'Required' : false} placeholder="CTR-RIL-2026-118" leadingIcon={<FileCheck2 size={17} strokeWidth={2.2} />} />
        <TextField label="Order Value" value={orderValue} onChange={setField('orderValue', setOrderValue)} error={touched.orderValue && !required(orderValue) ? 'Required' : false} placeholder="3.2 Cr" leadingIcon={<IndianRupee size={17} strokeWidth={2.2} />} />
        <DatePicker label="Completion Date" value={completionDate} onChange={setField('completionDate', setCompletionDate)} error={touched.completionDate && !required(completionDate) ? 'Required' : false} />
        <TextField label="Description" value={description} onChange={(value) => { setDescription(value); meaningfulChange(); }} placeholder="Order scope" className="lg:col-span-2" />
      </div>
    </GlassCard>
  );
}

