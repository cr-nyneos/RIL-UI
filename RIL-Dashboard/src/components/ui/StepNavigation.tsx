import { Check, Lock } from 'lucide-react';

import GlassCard from './GlassCard';

export interface StepItem<K extends string> {
  key: K;
  label: string;
}

interface StepNavigationProps<K extends string> {
  steps: StepItem<K>[];
  activeStep: K;
  highestUnlockedIndex: number;
  completed: Record<K, boolean>;
  onStepChange: (step: K) => void;
}

export default function StepNavigation<K extends string>({
  steps,
  activeStep,
  highestUnlockedIndex,
  completed,
  onStepChange,
}: StepNavigationProps<K>) {
  return (
    <GlassCard className="p-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const locked = index > highestUnlockedIndex;
          const active = activeStep === step.key;
          const done = completed[step.key];
          return (
            <button
              key={step.key}
              type="button"
              disabled={locked}
              title={locked ? 'Complete previous step first.' : step.label}
              onClick={() => onStepChange(step.key)}
              className={`group flex h-14 items-center gap-3 rounded-2xl px-4 text-left transition-all duration-200 ${
                active
                  ? 'bg-[var(--wash-brand-active)] text-brand-700 shadow-[inset_0_0_0_1px_var(--color-glass-hairline-deep)]'
                  : done
                    ? 'text-success hover:-translate-y-px hover:bg-[var(--color-success-soft)]'
                    : locked
                      ? 'cursor-not-allowed text-ink-400 opacity-70'
                      : 'text-ink-700 hover:-translate-y-px hover:bg-[var(--wash-brand-hover)]'
              }`}
            >
              <span className="glass-inset flex h-9 w-9 flex-none items-center justify-center rounded-xl">
                {locked ? (
                  <Lock size={16} strokeWidth={2.4} />
                ) : done ? (
                  <Check size={16} strokeWidth={2.6} />
                ) : (
                  <span className="text-body-strong tabular-nums">{index + 1}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body-strong">{step.label}</span>
                <span className="block text-meta">{locked ? 'Locked' : active ? 'Active' : done ? 'Completed' : 'Ready'}</span>
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
