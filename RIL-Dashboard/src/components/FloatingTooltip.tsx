import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
  gap?: number;
}

const MARGIN = 12; // keep at least this far from the viewport edges

/**
 * Shared premium tooltip. It measures itself and clamps its position so it can
 * never leave the screen — following the cursor, or anchored below a bar.
 */
export default function FloatingTooltip({ open, children, cursor, below, gap = 10 }: FloatingTooltipProps) {
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
  left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));

  const ready = w > 0; // avoid a flash at (0,0) before the first measurement

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="chart-tooltip"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: ready ? 1 : 0, scale: 1, x: left, y: top }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
