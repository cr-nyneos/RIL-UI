import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [lastPathname, setLastPathname] = useState(pathname);

  /* The rail re-collapses on every navigation; it only stays open for as long
     as the user keeps working on the page where they expanded it. */
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (!collapsed) setCollapsed(true);
  }

  return (
    /* Fixed-height shell: the rail never scrolls, only the content column does.
       That keeps the sidebar and the page header locked to the same distance
       from the top of the viewport at every scroll position. */
    <div className="app-canvas h-screen overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="-mr-4 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pr-4 sm:-mr-6 sm:pr-6">
          {/* <Topbar /> */}
          <main className="animate-page pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
