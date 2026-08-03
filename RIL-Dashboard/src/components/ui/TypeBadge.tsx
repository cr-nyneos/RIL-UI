import type { ContractType } from '../../lib/types/order';
import Badge from './Badge';

interface TypeBadgeProps {
  type: ContractType;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Badge tone={type === 'Manufactured' ? 'brand' : 'neutral'} shape="square" size="md">
      {type}
    </Badge>
  );
}
