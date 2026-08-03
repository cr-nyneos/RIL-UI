/* eslint-disable react-refresh/only-export-components --
   Tooltip style constants are shared by the chart tooltip content. */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface RectAnchor {
  left: number;
  bottom: number;
  width: number;
}

interface FloatingTooltipProps {
  open: boolean;
  children: ReactNode;
  /** Follow the cursor (clamped to the viewport). */
  cursor?: { x: number; y: number };
  /** Or sit centered below an element's rect, `gap` px beneath it. */
  below?: RectAnchor;
  /** Viewport-space keep-out zone (e.g. the chart) the tooltip must not cover. */
  avoid?: { left: number; right: number; top: number; bottom: number };
  gap?: number;
}

const MARGIN = 12; // keep at least this far from the viewport edges

/** Shared tooltip-content classes so every chart's tooltip body matches. */
export const TT_HEAD = 'flex items-center gap-2 text-[13px] font-semibold text-ink-900';
export const TT_DOT = 'h-2 w-2 rounded-[var(--radius-sm)] bg-current';
export const TT_VALUE = 'mt-1.5 text-[20px] leading-[1.15] font-semibold tabular-nums text-ink-900';
export const TT_ROW = 'mt-1.5 flex items-center justify-between gap-4 text-[12px] text-ink-500';
export const TT_TREND = 'inline-flex items-center gap-1 font-semibold [font-variant-numeric:tabular-nums]';
export const trendColor = (trend: number) => (trend >= 0 ? 'text-success' : 'text-danger');

/**
 * Shared premium tooltip. It measures itself and clamps its position so it can
 * never leave the screen — following the cursor, or anchored below a bar.
 */
export default function FloatingTooltip({ open, children, cursor, below, avoid, gap = 10 }: FloatingTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Re-measure every render (content can change size between items); the guard
  // makes this safe from update loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w !== size.w || h !== size.h) setSize({ w, h });
  });

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const { w, h } = size;

  let left = 0;
  let top = 0;
  if (below) {
    left = below.left + below.width / 2 - w / 2;
    top = below.bottom + gap;
  } else if (cursor) {
    left = cursor.x + 18;
    if (left + w > vw - MARGIN) left = cursor.x - w - 18; // flip to the left edge
    top = cursor.y - 24;
  }

  // Push the box clear of the keep-out zone so it never hides the thing it
  // describes. Sliding vertically first keeps it tracking the cursor's column.
  if (avoid && w > 0) {
    const hitsX = left < avoid.right + gap && left + w > avoid.left - gap;
    const hitsY = top < avoid.bottom + gap && top + h > avoid.top - gap;
    if (hitsX && hitsY) {
      const under = avoid.bottom + gap;
      const over = avoid.top - gap - h;
      const after = avoid.right + gap;
      const before = avoid.left - gap - w;
      if (under + h <= vh - MARGIN) top = under;
      else if (over >= MARGIN) top = over;
      else if (after + w <= vw - MARGIN) left = after;
      else if (before >= MARGIN) left = before;
    }
  }

  left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));

  const ready = w > 0; // avoid a flash at (0,0) before the first measurement

  if (typeof document === 'undefined') return null;

  // Portalled to <body> so no ancestor's `overflow: hidden`, transform or
  // stacking context can clip or bury the tooltip.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="fixed top-0 left-0 z-9998 min-w-42 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-menu)] px-3.5 py-3 pointer-events-none shadow-[0_8px_20px_-8px_rgba(23,37,84,0.20)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0, x: left, y: top }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
