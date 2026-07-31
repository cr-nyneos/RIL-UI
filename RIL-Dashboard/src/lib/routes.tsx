import {
  Building2,
  ClipboardPlus,
  Columns3,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import Dashboard from '../pages/Dashboard';
import CreateOrder from '../pages/CreateOrder';
import ExecutionBoard from '../pages/ExecutionBoard';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import RouteStub from '../pages/RouteStub';
import DispatchWorkspace from '../pages/DispatchWorkspace';
import GateWorkspace from '../pages/GateWorkspace';

export interface AppRoute {
  path: string;
  label: string;
  icon?: LucideIcon;
  element: ReactElement;
  nav?: boolean;
  navGroup?: string;
}

export const APP_ROUTES: AppRoute[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, element: <Dashboard />, nav: true },
  { path: '/orders', label: 'Orders', icon: Package, element: <Orders />, nav: true },
  { path: '/execution', label: 'Execution Board', icon: Columns3, element: <ExecutionBoard />, nav: true },
  { path: '/orders/create', label: 'Create Order', icon: ClipboardPlus, element: <CreateOrder />, nav: true, navGroup: '/orders' },
  { path: '/orders/dispatch', label: 'Dispatch Workspace', icon: Truck, element: <DispatchWorkspace />, nav: true, navGroup: '/orders' },
  { path: '/orders/:id/gates/:gate', label: 'Gate Workspace', element: <GateWorkspace /> },
  { path: '/orders/:id', label: 'Order Detail', element: <OrderDetail /> },
  { path: '/approvals', label: 'Approvals', icon: ShieldCheck, element: <RouteStub title="Approvals" />, nav: true },
  { path: '/vendors', label: 'Vendors', icon: Building2, element: <RouteStub title="Vendors" />, nav: true },
  { path: '/payments', label: 'Payments', icon: Wallet, element: <RouteStub title="Payments" />, nav: true },
];

export interface NavChild {
  to: string;
  label: string;
}

export interface NavEntry {
  to: string;
  icon: LucideIcon;
  label: string;
  children?: NavChild[];
}

export const PRIMARY_NAV: NavEntry[] = APP_ROUTES.filter(
  (route) => route.nav && route.icon && !route.navGroup,
).map((route) => {
  const nested = APP_ROUTES.filter((child) => child.nav && child.navGroup === route.path);
  return {
    to: route.path,
    icon: route.icon as LucideIcon,
    label: route.label,
    children: nested.length
      ? [{ to: route.path, label: route.label }, ...nested.map((child) => ({ to: child.path, label: child.label }))]
      : undefined,
  };
});

export function pageName(pathname: string): string {
  const exact = APP_ROUTES.find((route) => route.path === pathname);
  if (exact) return exact.label;
  if (pathname.includes('/gates/')) return 'Gate Workspace';
  if (pathname.startsWith('/orders/')) return 'Order Detail';
  return 'NyneOS';
}
