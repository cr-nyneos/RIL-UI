import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import SearchInput from '../../components/ui/SearchInput';
import { STAKEHOLDERS } from './constants';
import { initials } from './utils';
import type { Stakeholder, StakeholderRole } from './types';

interface StakeholderPickerProps {
  role: StakeholderRole;
  selected?: Stakeholder;
  onSelect: (stakeholder: Stakeholder) => void;
}

export default function StakeholderPicker({ role, selected, onSelect }: StakeholderPickerProps) {
  const [query, setQuery] = useState('');
  const matches = STAKEHOLDERS.filter((stakeholder) => {
    const term = `${stakeholder.name} ${stakeholder.role} ${stakeholder.plant}`.toLowerCase();
    return stakeholder.role === role && term.includes(query.toLowerCase());
  });

  return (
    <GlassCard interactive className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-body-strong">{role}</div>
          <div className="mt-1 text-meta">{selected?.name ?? 'Unassigned'}</div>
        </div>
        {selected && <CheckCircle2 size={19} strokeWidth={2.4} className="text-success" />}
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search stakeholder" className="mb-3" />
      <div className="space-y-2">
        {matches.map((stakeholder) => {
          const active = selected?.id === stakeholder.id;
          return (
            <button
              key={stakeholder.id}
              type="button"
              onClick={() => onSelect(stakeholder)}
              className={`glass-inset flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)] ${
                active ? 'ring-2 ring-[var(--color-brand-600)]' : ''
              }`}
            >
              <span className="glass-ring flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-600 text-[12px] font-semibold text-white">
                {initials(stakeholder.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-strong">{stakeholder.name}</span>
                <span className="block truncate text-meta">{stakeholder.plant}</span>
              </span>
              {active && <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

