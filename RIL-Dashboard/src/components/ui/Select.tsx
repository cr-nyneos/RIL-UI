import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

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
          inline-flex h-11 items-center justify-between gap-3
          rounded-2xl
          border border-[rgba(15,23,42,0.08)]
          bg-white
          px-5
          text-[15px]
          font-semibold
          text-ink-900
          shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]
          transition-all
          duration-200
          hover:border-[rgba(79,70,229,0.18)]
          hover:shadow-[0_12px_32px_-12px_rgba(79,70,229,0.18)]
          focus:outline-none
          focus:ring-2
          focus:ring-[rgba(79,70,229,0.18)]
          data-[state=open]:border-[rgba(79,70,229,0.30)]
          data-[state=open]:shadow-[0_16px_40px_-16px_rgba(79,70,229,0.25)]
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
            rounded-2xl
            border border-[rgba(15,23,42,0.08)]
            bg-white
            shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)]
            backdrop-blur-xl
            animate-in
            fade-in
            zoom-in-95
          "
        >
          <SelectPrimitive.Viewport className="p-2">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="
                  relative
                  flex
                  h-10
                  cursor-pointer
                  select-none
                  items-center
                  rounded-xl
                  px-10
                  text-[15px]
                  font-medium
                  text-ink-800
                  outline-none
                  transition-all
                  duration-150
                  hover:bg-[rgba(79,70,229,0.08)]
                  focus:bg-[rgba(79,70,229,0.08)]
                  data-[state=checked]:bg-[rgba(79,70,229,0.10)]
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