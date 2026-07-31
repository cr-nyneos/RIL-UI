import { useEffect } from 'react';

/**
 * Shared dismiss behaviour for the floating layers (Drawer, Modal): Escape
 * closes, and the page behind stops scrolling while one is open.
 */
export function useOverlayDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);
}
