import { Fuel, Radio, ShoppingBag, Cpu, Factory, type LucideIcon } from 'lucide-react';

/**
 * Single source of truth for both charts. Sharing one dataset keeps the
 * palette, ordering and identity consistent so the two visualizations can
 * cross-highlight each other by `key`.
 */
export interface Segment {
  key: string;
  /** Compact label used under the bars. */
  label: string;
  /** Fuller label used in the doughnut legend & center panel. */
  fullLabel: string;
  value: number;
  /** YoY % change; sign drives the trend arrow. */
  trend: number;
  description: string;
  from: string;
  to: string;
  glow: string;
  icon: LucideIcon;
}

export const SEGMENTS: Segment[] = [
  { key: 'o2c', label: 'O2C', fullLabel: 'O2C', value: 148, trend: 6.4, description: 'Oil-to-chemicals & fuels retail backbone.', from: '#5eead4', to: '#0d9488', glow: '#2dd4bf', icon: Fuel },
  { key: 'jio', label: 'Jio', fullLabel: 'Jio Platforms', value: 132, trend: 11.2, description: 'Connectivity & digital services at national scale.', from: '#67e8f9', to: '#0e7490', glow: '#22d3ee', icon: Radio },
  { key: 'retail', label: 'Retail', fullLabel: 'Retail', value: 96, trend: 8.1, description: 'Omnichannel consumer retail network.', from: '#93c5fd', to: '#1d4ed8', glow: '#3b82f6', icon: ShoppingBag },
  { key: 'digital', label: 'Digital', fullLabel: 'Digital', value: 61, trend: -2.3, description: 'Media, apps & emerging platforms.', from: '#c4b5fd', to: '#6d28d9', glow: '#8b5cf6', icon: Cpu },
  { key: 'energy', label: 'New Energy', fullLabel: 'New Energy', value: 44, trend: 24.6, description: 'Solar, hydrogen & clean-energy build-out.', from: '#fcd34d', to: '#d97706', glow: '#fbbf24', icon: Factory },
];

export const SEGMENT_TOTAL = SEGMENTS.reduce((s, d) => s + d.value, 0);
export const SEGMENT_MAX = Math.max(...SEGMENTS.map((d) => d.value));
