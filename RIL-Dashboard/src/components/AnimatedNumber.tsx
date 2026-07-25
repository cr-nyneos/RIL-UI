import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  /** Decimal places to render. */
  decimals?: number;
  /** String rendered before the number, e.g. "$". */
  prefix?: string;
  /** String rendered after the number, e.g. "%" or "B". */
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * Counts a number up from 0 to `value` the first time it scrolls into view.
 * Shared by both charts so value labels never appear instantly.
 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = `${prefix}${latest.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, prefix, suffix, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${(0).toFixed(decimals)}${suffix}`}
    </span>
  );
}
