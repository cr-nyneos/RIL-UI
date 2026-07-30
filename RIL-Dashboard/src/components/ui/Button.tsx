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
  sm: 'h-9 px-3.5 text-[14px]',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-13 px-6 text-[15px]',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'h-[34px] w-[34px]',
  md: 'h-[38px] w-[38px]',
  lg: 'h-11 w-11',
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'button-specular button-sweep overflow-hidden bg-[linear-gradient(135deg,var(--color-brand-600)_0%,var(--color-violet)_100%)] text-white shadow-[0_1px_1px_rgba(16,24,40,0.06),0_12px_26px_-10px_rgba(79,70,229,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 hover:shadow-[0_2px_2px_rgba(16,24,40,0.07),0_20px_40px_-12px_rgba(79,70,229,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] active:translate-y-0',
  secondary:
    'button-specular glass-inset text-ink-700 hover:-translate-y-px hover:border-[rgba(79,70,229,0.22)] hover:bg-[var(--wash-brand-hover)] hover:text-ink-900',
  ghost: 'bg-transparent text-ink-600 hover:bg-[var(--wash-brand-hover)] hover:text-brand-700',
  icon: 'glass-inset justify-center text-ink-600 hover:-translate-y-px hover:bg-[var(--wash-brand-hover)] hover:text-brand-600',
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
    'relative inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-transparent font-semibold outline-none transition-[transform,box-shadow,background,color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0',
    variant === 'primary' ? 'font-bold' : '',
    isIcon ? `${ICON_SIZE[size]} rounded-[var(--radius-sm)] p-0` : SIZE[size],
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
