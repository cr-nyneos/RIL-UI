import type { ReactNode } from 'react';

export type Tone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'violet' | 'cyan';
export type Size = 'xs' | 'sm' | 'md' | 'lg';

export interface Option<T = string> {
  value: T;
  label: string;
}

export interface WithChildren {
  children: ReactNode;
}
