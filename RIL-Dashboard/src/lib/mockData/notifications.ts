import type { AppNotification, NotificationModule, NotificationPriority } from '../types/notifications';

const NOW = new Date();
const MIDNIGHT = new Date(NOW);
MIDNIGHT.setHours(0, 0, 0, 0);

function today(minutesAgo: number): string {
  const stamp = Math.max(NOW.getTime() - minutesAgo * 60_000, MIDNIGHT.getTime() + 60_000);
  return new Date(stamp).toISOString();
}

function earlier(days: number, hour: number, minute: number): string {
  const date = new Date(NOW);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const NOTIFICATION_MODULES: NotificationModule[] = [
  'Orders',
  'Approvals',
  'Site Operations',
  'Finance',
  'Vendors',
  'Execution',
];

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['Critical', 'High', 'Medium', 'Low'];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NTF-4101',
    title: 'Governance approval breached SLA for ₹4.5 Cr award',
    module: 'Approvals',
    orderId: 'ORD-2045',
    priority: 'Critical',
    timestamp: today(35),
    read: false,
    escalated: true,
  },
  {
    id: 'NTF-4102',
    title: 'Damaged items reported against inbound consignment',
    module: 'Orders',
    orderId: 'ORD-2047',
    priority: 'Critical',
    timestamp: today(95),
    read: false,
    escalated: true,
  },
  {
    id: 'NTF-4103',
    title: 'Security clearance pending before gate-in',
    module: 'Approvals',
    orderId: 'ORD-2048',
    priority: 'High',
    timestamp: today(160),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4104',
    title: 'Document verification awaiting test certificate',
    module: 'Approvals',
    orderId: 'ORD-2043',
    priority: 'High',
    timestamp: today(240),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4105',
    title: 'Shipment SHP-5502 arrived with 8 missing units',
    module: 'Site Operations',
    orderId: 'ORD-2044',
    priority: 'High',
    timestamp: today(310),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4106',
    title: 'Invoice mismatch held payment release',
    module: 'Finance',
    orderId: 'ORD-2047',
    priority: 'High',
    timestamp: today(420),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4107',
    title: 'Expected delivery date passed without dispatch',
    module: 'Execution',
    orderId: 'ORD-2042',
    priority: 'Critical',
    timestamp: earlier(1, 18, 20),
    read: false,
    escalated: true,
  },
  {
    id: 'NTF-4108',
    title: 'Security pass expiring in 3 days for site crew',
    module: 'Vendors',
    orderId: 'ORD-2044',
    priority: 'Medium',
    timestamp: earlier(1, 15, 5),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4109',
    title: 'QC inspection recorded as partial fail',
    module: 'Orders',
    orderId: 'ORD-2041',
    priority: 'High',
    timestamp: earlier(1, 11, 40),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4110',
    title: 'SCF financing triggered on closed milestone',
    module: 'Finance',
    orderId: 'ORD-2046',
    priority: 'Medium',
    timestamp: earlier(2, 16, 30),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4111',
    title: 'Gate-out weighment variance flagged at plant',
    module: 'Site Operations',
    orderId: 'ORD-2043',
    priority: 'Medium',
    timestamp: earlier(2, 9, 15),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4112',
    title: 'Stakeholder reassigned on delivery confirmation gate',
    module: 'Execution',
    orderId: 'ORD-2044',
    priority: 'Low',
    timestamp: earlier(3, 14, 10),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4113',
    title: 'Vendor compliance documents due for renewal',
    module: 'Vendors',
    orderId: 'ORD-2042',
    priority: 'Medium',
    timestamp: earlier(3, 10, 25),
    read: false,
    escalated: false,
  },
  {
    id: 'NTF-4114',
    title: 'Financial release approved for milestone 2',
    module: 'Finance',
    orderId: 'ORD-2041',
    priority: 'Low',
    timestamp: earlier(4, 17, 45),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4115',
    title: 'Manpower headcount below planned strength',
    module: 'Site Operations',
    orderId: 'ORD-2045',
    priority: 'Low',
    timestamp: earlier(5, 8, 50),
    read: true,
    escalated: false,
  },
  {
    id: 'NTF-4116',
    title: 'Project completion file closed and archived',
    module: 'Orders',
    orderId: 'ORD-2046',
    priority: 'Low',
    timestamp: earlier(6, 12, 5),
    read: true,
    escalated: false,
  },
];
