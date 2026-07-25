import type { Transition } from 'framer-motion';

/**
 * Shared motion language so both charts read as one product.
 * SPRING is the default tactile response; SPRING_SOFT is for larger,
 * calmer moves; EASE_OUT is the standard tween curve for enters/counts.
 */
export const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 24 };
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 120, damping: 20 };
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
