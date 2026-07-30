import Select from '../ui/Select';
import Tabs from '../ui/Tabs';
import { PLANTS } from '../../lib/mockData/dashboard';
import type { PlantFilter, ContractTypeFilter, PeriodFilter } from '../../lib/dashboardFilters';

interface DashboardFiltersProps {
  plant: PlantFilter;
  onPlantChange: (v: PlantFilter) => void;
  contractType: ContractTypeFilter;
  onContractTypeChange: (v: ContractTypeFilter) => void;
  period: PeriodFilter;
  onPeriodChange: (v: PeriodFilter) => void;
}

export default function DashboardFilters({
  plant,
  onPlantChange,
  contractType,
  onContractTypeChange,
  period,
  onPeriodChange,
}: DashboardFiltersProps) {
  return (
    <div className="animate-rise flex flex-wrap items-center gap-3" style={{ animationDelay: '140ms' }}>
      <Select
        ariaLabel="Filter by plant"
        value={plant}
        onChange={onPlantChange}
        options={[{ value: 'all', label: 'All Plants' }, ...PLANTS.map((p) => ({ value: p.id, label: p.label }))]}
      />
      <Select
        ariaLabel="Filter by period"
        value={period}
        onChange={onPeriodChange}
        options={[
          { value: '3m', label: 'Last 3 Months' },
          { value: '6m', label: 'Last 6 Months' },
        ]}
      />
       <Tabs
        active={contractType}
        onChange={(value) => onContractTypeChange(value as ContractTypeFilter)}
        size="sm"
        variant="segmented"
        tabs={[
          { key: 'all', label: 'All' },
          { key: 'Manufactured', label: 'Manufactured' },
          { key: 'Material', label: 'Material' },
        ]}
      />
    </div>
  );
}
