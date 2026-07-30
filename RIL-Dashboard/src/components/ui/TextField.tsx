import { X } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import Button from './Button';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: string;
  error?: string | boolean;
  size?: 'md' | 'lg';
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
  clearable?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export default function TextField({
  label,
  id,
  error,
  size = 'md',
  leadingIcon,
  trailingAction,
  clearable = false,
  className = '',
  value,
  onChange,
  type = 'text',
  ...props
}: TextFieldProps) {
  const height = size === 'lg' ? 'h-14' : 'h-11';
  const inputPadding = `${leadingIcon ? 'pl-10' : 'pl-4'} ${trailingAction || (clearable && value) ? 'pr-11' : 'pr-4'}`;
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-2.5 block text-[16px] font-semibold text-ink-900">
          {label}
        </label>
      )}
      <div
        className={`focus-bloom relative flex ${height} items-center rounded-[var(--radius-md)] border bg-white ${
          error ? 'border-danger/40' : 'border-[var(--color-glass-hairline-deep)]'
        }`}
      >
        {leadingIcon && <span className="pointer-events-none absolute left-3.5 text-ink-400">{leadingIcon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`h-full w-full rounded-[var(--radius-md)] bg-transparent ${inputPadding} text-[16px] font-medium text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 ${
            size === 'md' ? 'text-[15px] font-semibold text-ink-800' : ''
          }`}
          {...props}
        />
        {trailingAction && <span className="absolute right-3 flex items-center">{trailingAction}</span>}
        {clearable && value && !trailingAction && (
          <Button variant="icon" size="sm" aria-label="Clear field" onClick={() => onChange('')} className="absolute right-2 h-7 w-7">
            <X size={15} strokeWidth={2.4} />
          </Button>
        )}
      </div>
      {typeof error === 'string' && error && <p className="mt-1.5 text-[12px] font-semibold text-kpi-danger-text">{error}</p>}
    </div>
  );
}
