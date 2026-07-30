import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

type LinkLike = typeof Link;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  as?: 'button' | LinkLike | ComponentType<Record<string, unknown>>;
  to?: string;
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-3.5 text-[14px]',
  lg: 'h-11 px-5 text-[14px]',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border-[var(--color-border)] bg-white text-ink-700 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-subtle)] hover:text-ink-900',
  ghost: 'bg-transparent text-ink-600 hover:bg-[var(--color-surface-subtle)] hover:text-ink-900',
  icon: 'justify-center border-[var(--color-border)] bg-white text-ink-600 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-subtle)] hover:text-ink-900',
  link: 'h-auto bg-transparent px-0 text-brand-700 hover:underline hover:underline-offset-[3px]',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  as = 'button',
  children,
  className = '',
  type,
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon';
  const contentIcon = loading ? <Loader2 size={16} className="animate-spin" /> : icon;
  const classes = [
    'relative inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-transparent font-semibold outline-none transition-[background,color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-55',
    isIcon ? `${ICON_SIZE[size]} rounded-[var(--radius-md)] p-0` : SIZE[size],
    fullWidth ? 'w-full justify-center' : '',
    loading && variant === 'primary' ? 'is-loading' : '',
    VARIANT[variant],
    className,
  ].join(' ');

  const body = (
    <>
      {contentIcon && iconPosition === 'left' && <span className="relative z-1 flex-none">{contentIcon}</span>}
      {children && <span className="relative z-1">{children}</span>}
      {contentIcon && iconPosition === 'right' && <span className="relative z-1 flex-none">{contentIcon}</span>}
    </>
  );

  if (as !== 'button') {
    const Component = as as ComponentType<Record<string, unknown>>;
    const componentProps = props as Record<string, unknown>;
    return (
      <Component className={classes} aria-disabled={disabled || loading} {...componentProps}>
        {body}
      </Component>
    );
  }

  return (
    <button type={type ?? 'button'} disabled={disabled || loading} className={classes} {...props}>
      {body}
    </button>
  );
}
