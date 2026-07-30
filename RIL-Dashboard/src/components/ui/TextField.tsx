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
  const height = size === 'lg' ? 'h-12' : 'h-10';
  const inputPadding = `${leadingIcon ? 'pl-9.5' : 'pl-3.5'} ${trailingAction || (clearable && value) ? 'pr-10' : 'pr-3.5'}`;
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <div
        className={`focus-bloom relative flex ${height} items-center rounded-[var(--radius-md)] border bg-white ${
          error ? 'border-danger' : 'border-[var(--color-border)]'
        }`}
      >
        {leadingIcon && <span className="pointer-events-none absolute left-3 text-ink-400">{leadingIcon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`h-full w-full rounded-[var(--radius-md)] bg-transparent ${inputPadding} text-[14px] font-medium text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 ${
            size === 'md' ? 'font-semibold text-ink-800' : ''
          }`}
          {...props}
        />
        {trailingAction && <span className="absolute right-3 flex items-center">{trailingAction}</span>}
        {clearable && value && !trailingAction && (
          <Button variant="icon" size="sm" aria-label="Clear field" onClick={() => onChange('')} className="absolute right-1.5 h-7 w-7">
            <X size={15} strokeWidth={2.4} />
          </Button>
        )}
      </div>
      {typeof error === 'string' && error && <p className="mt-1 text-[12px] font-semibold text-danger">{error}</p>}
    </div>
  );
}
