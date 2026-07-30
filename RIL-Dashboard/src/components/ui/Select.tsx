import { ChevronDown } from 'lucide-react';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export default function Select<T extends string>({ options, value, onChange, className = '', ariaLabel }: SelectProps<T>) {
  return (
    <div className={`glass-inset relative inline-flex items-center ${className}`}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none bg-transparent py-2 pr-8 pl-3.5 text-[15px] font-semibold text-ink-800 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-ink-500" />
    </div>
  );
}
