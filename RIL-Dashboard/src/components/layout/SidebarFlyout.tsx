import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface SidebarFlyoutProps {
  anchor: DOMRect;
  children: ReactNode;
  interactive?: boolean;
  align?: 'center' | 'top';
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function SidebarFlyout({
  anchor,
  children,
  interactive,
  align = 'center',
  onMouseEnter,
  onMouseLeave,
}: SidebarFlyoutProps) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: anchor.right,
        top: align === 'center' ? anchor.top + anchor.height / 2 : anchor.top,
        transform: align === 'center' ? 'translateY(-50%)' : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`z-50 pl-3 ${interactive ? '' : 'pointer-events-none'}`}
    >
      {children}
    </div>,
    document.body,
  );
}
