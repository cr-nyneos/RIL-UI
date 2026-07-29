interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`glass-inset inline-flex items-center gap-0.5 p-1 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-200 ${
              active ? 'bg-brand-soft2 text-brand-600' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
