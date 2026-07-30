import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-canvas">
      <div className="mx-auto flex max-w-[1600px] gap-4 px-4 py-4 sm:px-6">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="min-w-0 flex-1">
          {/* <Topbar /> */}
          <main className="pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
