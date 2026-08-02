import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

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

    <div className="app-canvas h-screen overflow-hidden">
      <Navbar sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={`h-screen min-w-0 overflow-x-hidden overflow-y-auto pt-[72px] transition-all duration-300 ${
          collapsed ? 'pl-[86px]' : 'pl-[266px]'
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-5 py-5 sm:px-8 sm:py-6">
          {/* <Topbar /> */}
          <main className="animate-page pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
