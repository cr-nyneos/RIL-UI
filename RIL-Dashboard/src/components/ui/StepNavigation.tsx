import { Check, Lock } from 'lucide-react';

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
  className?: string;
}

export default function StepNavigation<K extends string>({
  steps,
  activeStep,
  highestUnlockedIndex,
  completed,
  onStepChange,
  className = '',
}: StepNavigationProps<K>) {
  return (
    <div className={`grid grid-cols-1 lg:auto-cols-fr lg:grid-flow-col ${className}`}>
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
            className={`relative flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-4 text-left transition-colors duration-150 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0 ${
              active
                ? 'bg-[var(--color-surface-selected)]'
                : locked
                  ? 'cursor-not-allowed bg-[var(--color-surface-section)]'
                  : 'bg-[var(--color-surface-section)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600" />}
            <span
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-sm)] border text-[13px] font-semibold tabular-nums ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : done
                    ? 'border-[var(--color-success)] bg-success-soft text-success'
                    : locked
                      ? 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-ink-400'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-ink-600'
              }`}
            >
              {locked ? <Lock size={14} strokeWidth={2.4} /> : done && !active ? <Check size={15} strokeWidth={2.6} /> : index + 1}
            </span>
            <span className="min-w-0">
              <span
                className={`block truncate text-[14px] leading-5 font-semibold ${
                  active ? 'text-brand-700' : locked ? 'text-ink-400' : 'text-ink-800'
                }`}
              >
                {step.label}
              </span>
              {!locked && (
                <span className="text-meta block truncate">
                  {active ? 'Active' : done ? 'Completed' : 'Ready'}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
