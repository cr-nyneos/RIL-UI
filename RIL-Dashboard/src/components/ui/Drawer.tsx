import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useOverlayDismiss } from './overlay';

interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Drawer({ open, title, description, onClose, footer, children }: DrawerProps) {
  useOverlayDismiss(open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-70 flex justify-end">
      <div
        className="animate-fade absolute inset-0 bg-[rgba(23,37,84,0.32)]"
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-drawer relative flex h-full w-[420px] max-w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-section)] shadow-[-8px_0_28px_-12px_rgba(23,37,84,0.24)]"
      >
        <header className="surface-section-head flex items-start justify-between gap-3 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-section-title truncate">{title}</h2>
            {description && <p className="text-meta mt-0.5 truncate">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            autoFocus
            className="flex-none cursor-pointer rounded-[var(--radius-sm)] text-ink-400 outline-none transition-colors duration-150 hover:text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3.5">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  );
}
