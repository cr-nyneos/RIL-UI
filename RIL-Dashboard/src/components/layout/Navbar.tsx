import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Calendar, Mail, Menu, User, Warehouse, X } from 'lucide-react';
import { PRIMARY_NAV } from '../../lib/routes';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const USER = {
  name: 'Rohit Sharma',
  email: 'rohit.sharma@nyneos.com',
  role: 'Operations Manager',
  lastLoginTime: new Date().toISOString(),
};

const NavItems: React.FC<{
  items: { to: string; icon: any; label: string }[];
  active: string;
  onChange: (to: string) => void;
}> = ({ items, active, onChange }) => (
  <div className="flex items-center space-x-4 ml-8">
    {items.map((item, i) => {
      const isActive = active === item.to;
      return (
        <div
          key={i}
          onClick={() => onChange(item.to)}
          className={`group flex items-center space-x-2 px-2 py-2 cursor-pointer transition-colors ${
            isActive
              ? 'text-brand-600 font-medium border-b-2 border-brand-600'
              : 'text-ink-600 hover:text-brand-600'
          }`}
        >
          <item.icon
            size={18}
            className={`transition-colors ${
              isActive ? 'text-brand-600' : 'text-ink-600 group-hover:text-brand-600'
            }`}
          />
          <span
            className={`text-sm overflow-hidden transition-all duration-500 ease-in-out ${
              isActive ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
            } group-hover:max-w-[140px] group-hover:opacity-100 whitespace-nowrap`}
          >
            {item.label}
          </span>
        </div>
      );
    })}
  </div>
);

const UserDropdown: React.FC<{ isOpen: boolean }> = ({ isOpen }) =>
  isOpen ? (
    <div
      className="absolute right-0 mt-2 w-72 border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50"
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
      }}
    >
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-white font-semibold">
              {USER.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="font-semibold text-white">{USER.name}</p>
            <p className="text-xs text-white/80">{USER.role}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 bg-[var(--color-surface-page)]">
        <div className="flex items-start space-x-3">
          <Mail className="w-4 h-4 text-ink-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-ink-700 break-all">{USER.email}</p>
        </div>
        <div className="flex items-start space-x-3">
          <Calendar className="w-4 h-4 text-ink-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-ink-600">Last active</p>
            <p className="text-xs font-medium text-ink-700">
              {new Date(USER.lastLoginTime).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gradient-to-r from-brand-700 to-brand-500 border-t border-[var(--color-border)] flex justify-end">
        <button className="text-xs text-white transition-colors">Sign Out</button>
      </div>
    </div>
  ) : null;

export default function Navbar({ sidebarCollapsed, onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const activeTo =
    PRIMARY_NAV.filter((item) => item.to === '/' ? pathname === '/' : pathname.startsWith(item.to))
      .sort((a, b) => b.to.length - a.to.length)[0]?.to ?? '/';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDetailsVisible(false);
      }
    }
    if (isUserDetailsVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDetailsVisible]);

  return (
    <nav
      className={`fixed top-0 right-0 h-[72px] bg-[var(--color-surface-page)] shadow-md border-b-[1px] border-gray-600/20 flex items-center z-50 transition-all duration-500 w-full ${
        sidebarCollapsed ? 'pl-[14px]' : 'pl-[24px]'
      }`}
    >
      <div className="relative z-[51] flex items-center">
        <div className="flex items-center gap-2.5 mr-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-brand-600 text-white">
            <Warehouse size={21} strokeWidth={2.2} />
          </span>
          {!sidebarCollapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[18px] leading-6 font-bold tracking-tight text-ink-900">
                NyneOS
              </span>
              <span className="truncate text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-600 uppercase">
                Vendor Mgmt
              </span>
            </span>
          )}
        </div>
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <Menu size={24} className="text-brand-600" />
          ) : (
            <X size={24} className="text-brand-600" />
          )}
        </button>
      </div>

      <div className="ml-auto mr-6">
        <NavItems items={PRIMARY_NAV} active={activeTo} onChange={(to) => navigate(to)} />
      </div>

      <div className="flex items-center space-x-4 mr-4">
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-ink-600" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </button>
        <div className="relative" ref={userDropdownRef}>
          <div
            onClick={() => setIsUserDetailsVisible((prev) => !prev)}
            className="flex items-center space-x-2 cursor-pointer hover:bg-[var(--color-surface-hover)] px-3 py-2 rounded-full transition-colors"
          >
            <div className="w-8 h-8 bg-[var(--color-surface-selected)] rounded-full flex items-center justify-center">
              <User size={16} className="text-brand-600" />
            </div>
          </div>
          <UserDropdown isOpen={isUserDetailsVisible} />
        </div>
      </div>
    </nav>
  );
}
