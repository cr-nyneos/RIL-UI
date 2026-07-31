import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useOverlayDismiss } from './overlay';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  width?: string;
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  footer,
  children,
  width = '520px',
}: ModalProps) {
  useOverlayDismiss(open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div
        className="animate-fade absolute inset-0 bg-[rgba(16,24,40,0.32)]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className="animate-rise surface-section relative flex max-h-full w-full flex-col overflow-hidden shadow-[0_12px_32px_-12px_rgba(16,24,40,0.30)]"
      >
        <header className="surface-section-head flex items-start justify-between gap-3 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-section-title truncate">{title}</h2>
            {description && <p className="text-meta mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex-none cursor-pointer rounded-[var(--radius-sm)] text-ink-400 outline-none transition-colors duration-150 hover:text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
