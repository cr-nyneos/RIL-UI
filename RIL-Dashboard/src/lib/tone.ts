import type { Tone } from './types/ui';

export interface ToneTokens {
  text: string;
  fill: string;
  soft: string;
  border: string;
}

const TOKENS: Record<Tone, ToneTokens> = {
  brand: {
    text: 'var(--color-brand-700)',
    fill: 'var(--color-brand-600)',
    soft: 'var(--wash-brand-active)',
    border: 'rgba(79,70,229,0.20)',
  },
  info: {
    text: 'var(--color-info)',
    fill: 'var(--color-info)',
    soft: 'var(--color-info-soft)',
    border: 'rgba(79,70,229,0.20)',
  },
  success: {
    text: 'var(--color-success)',
    fill: 'var(--color-success)',
    soft: 'rgba(16,185,129,0.09)',
    border: 'rgba(16,185,129,0.18)',
  },
  warning: {
    text: 'var(--color-kpi-warning-text)',
    fill: 'var(--color-warning)',
    soft: 'rgba(234,166,64,0.10)',
    border: 'rgba(234,166,64,0.20)',
  },
  danger: {
    text: 'var(--color-kpi-danger-text)',
    fill: 'var(--color-danger)',
    soft: 'rgba(244,63,94,0.09)',
    border: 'rgba(244,63,94,0.18)',
  },
  neutral: {
    text: 'var(--color-ink-700)',
    fill: 'var(--color-ink-400)',
    soft: 'var(--color-chip-neutral)',
    border: 'var(--color-glass-hairline-deep)',
  },
  violet: {
    text: 'var(--color-violet)',
    fill: 'var(--color-violet-500)',
    soft: 'var(--color-violet-soft)',
    border: 'rgba(139,92,246,0.20)',
  },
  cyan: {
    text: 'var(--color-cyan)',
    fill: 'var(--color-aqua-400)',
    soft: 'var(--color-cyan-soft)',
    border: 'rgba(34,211,238,0.22)',
  },
};

export function toneToken(tone: Tone): ToneTokens {
  return TOKENS[tone];
}
