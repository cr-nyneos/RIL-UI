interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

export default function Switch({ checked, onChange, label, description, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`focus-bloom flex w-full cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-input)] px-4 py-3 text-left transition-colors duration-150 hover:border-[var(--color-border-strong)] ${className}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] leading-6 font-semibold text-ink-800">{label}</span>
        {description && (
          <span className="mt-0.5 block truncate text-[13px] leading-5 font-medium text-ink-600">{description}</span>
        )}
      </span>

      <span
        aria-hidden
        className="relative h-5 w-9 flex-none rounded-full transition-colors duration-150"
        style={{ background: checked ? 'var(--color-brand-600)' : 'var(--color-ink-300)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}
