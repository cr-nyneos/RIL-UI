import {
  Building2,
  ClipboardPlus,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import Dashboard from '../pages/Dashboard';
import CreateOrder from '../pages/CreateOrder';
import Orders from '../pages/Orders';
import RouteStub from '../pages/RouteStub';

export interface AppRoute {
  path: string;
  label: string;
  icon?: LucideIcon;
  element: ReactElement;
  nav?: boolean;
}

export const APP_ROUTES: AppRoute[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, element: <Dashboard />, nav: true },
  { path: '/orders', label: 'Orders', icon: Package, element: <Orders />, nav: true },
  { path: '/orders/create', label: 'Create Order', icon: ClipboardPlus, element: <CreateOrder />, nav: true },
  { path: '/orders/:id', label: 'Order Detail', element: <RouteStub /> },
  { path: '/approvals', label: 'Approvals', icon: ShieldCheck, element: <RouteStub title="Approvals" />, nav: true },
  { path: '/vendors', label: 'Vendors', icon: Building2, element: <RouteStub title="Vendors" />, nav: true },
  { path: '/payments', label: 'Payments', icon: Wallet, element: <RouteStub title="Payments" />, nav: true },
];

export const PRIMARY_NAV = APP_ROUTES.filter((route) => route.nav && route.icon).map((route) => ({
  to: route.path,
  icon: route.icon as LucideIcon,
  label: route.label,
}));

export function pageName(pathname: string): string {
  const exact = APP_ROUTES.find((route) => route.path === pathname);
  if (exact) return exact.label;
  if (pathname === '/orders/create') return 'Create Order';
  if (pathname.startsWith('/orders/')) return 'Order Detail';
  return 'NyneOS';
}
