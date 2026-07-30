import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { Option } from '../../lib/types/ui';

interface SelectProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export default function Select<T extends string>({
  options,
  value,
  onChange,
  className = '',
  ariaLabel,
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={`cursor-pointer
          inline-flex h-10 items-center justify-between gap-3
          rounded-[var(--radius-md)]
          focus-bloom
          border border-[var(--color-border)]
          bg-white
          px-3.5
          text-[14px]
          font-semibold
          text-ink-900
          transition-colors
          duration-150
          hover:border-[var(--color-border-strong)]
          data-[state=open]:border-brand-600
          ${className}
        `}
      >
        <SelectPrimitive.Value />

        <SelectPrimitive.Icon>
          <ChevronDown
            size={17}
            strokeWidth={2.2}
            className="text-ink-500 transition-transform duration-200 data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          className="
            z-50
            overflow-hidden
            rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-white
            shadow-[0_8px_20px_-8px_rgba(16,24,40,0.16)]
            animate-in
            fade-in
          "
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="
                  relative
                  flex
                  h-9
                  cursor-pointer
                  select-none
                  items-center
                  rounded-[var(--radius-sm)]
                  px-9
                  text-[14px]
                  font-medium
                  text-ink-800
                  outline-none
                  transition-colors
                  duration-150
                  hover:bg-[var(--color-surface-subtle)]
                  focus:bg-[var(--color-surface-subtle)]
                  data-[state=checked]:bg-[var(--wash-brand-active)]
                  data-[state=checked]:font-semibold
                  data-[state=checked]:text-brand-700
                "
              >
                <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check
                      size={15}
                      strokeWidth={2.6}
                      className="text-brand-700"
                    />
                  </SelectPrimitive.ItemIndicator>
                </span>

                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
