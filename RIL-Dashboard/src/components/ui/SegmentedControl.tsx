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
            className={`rounded-lg cursor-pointer px-3 py-1.5 text-[15px] transition-colors duration-200 ${
              active ? 'bg-brand-soft2 font-bold text-brand-700' : 'font-semibold text-ink-600 hover:text-ink-800'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
