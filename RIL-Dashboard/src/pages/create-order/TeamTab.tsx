import type { Dispatch, SetStateAction } from 'react';
import { Users } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import { ROLE_ORDER, STEP_COPY } from './constants';
import StakeholderPicker from './StakeholderPicker';
import type { Stakeholder, StakeholderRole } from './types';

interface TeamTabProps {
  stakeholders: Partial<Record<StakeholderRole, Stakeholder>>;
  setStakeholders: Dispatch<SetStateAction<Partial<Record<StakeholderRole, Stakeholder>>>>;
  meaningfulChange: () => void;
}

export default function TeamTab({ stakeholders, setStakeholders, meaningfulChange }: TeamTabProps) {
  return (
    <GlassCard key="team" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={Users} {...STEP_COPY.team} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {ROLE_ORDER.map((role) => (
          <StakeholderPicker
            key={role}
            role={role}
            selected={stakeholders[role]}
            onSelect={(stakeholder) => {
              setStakeholders((current) => ({ ...current, [role]: stakeholder }));
              meaningfulChange();
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}
