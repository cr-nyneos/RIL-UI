import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    /* Fixed-height shell: the rail never scrolls, only the content column does.
       That keeps the sidebar and the page header locked to the same distance
       from the top of the viewport at every scroll position. */
    <div className="app-canvas h-screen overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {/* <Topbar /> */}
          <main className="animate-page pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
