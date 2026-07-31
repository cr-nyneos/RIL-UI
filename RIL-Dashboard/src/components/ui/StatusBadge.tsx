/* eslint-disable react-refresh/only-export-components --
   getStatusTone is deliberately co-located with the badge: it is the single
   source of truth for status colour and every page derives its tone from it. */
import Badge from './Badge';
import type { Tone } from '../../lib/types/ui';

export type StatusTone = Extract<Tone, 'success' | 'warning' | 'danger' | 'neutral'>;

const SUCCESS = ['on track', 'delivered', 'verified', 'paid', 'passed', 'cleared', 'approved', 'matched', 'collected'];
const NEUTRAL_BRAND = ['in transit', 'gate-in', 'in qc', 'active', 'draft', 'submitted'];
const WARNING = ['partially delivered', 'pending', 'awaiting', 'scheduled', 'expiring'];
const DANGER = ['delayed', 'blocked', 'overdue', 'rejected', 'failed', 'fail', 'mismatch', 'damaged', 'escalated', 'critical', 'expired'];
const NEUTRAL = ['completed', 'archived', 'n/a'];

/**
 * Single source of truth for status colour. Every page derives its tone from
 * here so the same status can never render two different colours.
 */
export function getStatusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (DANGER.some((k) => s.includes(k))) return 'danger';
  if (WARNING.some((k) => s.includes(k))) return 'warning';
  if (SUCCESS.some((k) => s.includes(k))) return 'success';
  if (NEUTRAL_BRAND.some((k) => s.includes(k))) return 'neutral';
  if (NEUTRAL.some((k) => s.includes(k))) return 'neutral';
  return 'neutral';
}

export function isEscalated(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes('escalated') || s.includes('critical') || s.includes('blocked');
}

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  wrap?: boolean;
  className?: string;
}

export default function StatusBadge({ status, size = 'md', wrap = false, className = '' }: StatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <Badge tone={tone} size={size} variant="soft" pulse={isEscalated(status)} wrap={wrap} className={className}>
      {status}
    </Badge>
  );
}
