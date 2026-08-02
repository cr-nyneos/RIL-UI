import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, Mail, MailOpen, RotateCcw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';

import { NOTIFICATION_MODULES, NOTIFICATION_PRIORITIES } from '../lib/mockData/notifications';
import { notificationTarget, useNotifications } from '../lib/notifications/NotificationsContext';
import { formatDate, formatTime } from '../lib/format';
import {
  notificationState,
  type AppNotification,
  type NotificationPriority,
  type NotificationState,
} from '../lib/types/notifications';
import type { Tone } from '../lib/types/ui';

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  query: '',
  module: 'all',
  priority: 'all',
  state: 'all',
};

type NotificationFilters = typeof EMPTY_FILTERS;

const MODULE_OPTIONS = [
  { value: 'all', label: 'All Modules' },
  ...NOTIFICATION_MODULES.map((module) => ({ value: module, label: module })),
];
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  ...NOTIFICATION_PRIORITIES.map((priority) => ({ value: priority, label: priority })),
];
const STATE_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Unread', label: 'Unread' },
  { value: 'Read', label: 'Read' },
  { value: 'Escalated', label: 'Escalated' },
];

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const PRIORITY_COLOR: Record<NotificationPriority, string> = {
  Critical: 'var(--color-danger)',
  High: 'var(--color-warning)',
  Medium: 'var(--color-brand-500)',
  Low: 'var(--color-ink-400)',
};

const STATE_TONE: Record<NotificationState, Tone> = {
  Escalated: 'danger',
  Unread: 'brand',
  Read: 'neutral',
};

function isToday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function matches(notification: AppNotification, filters: NotificationFilters): boolean {
  const query = filters.query.trim().toLowerCase();
  if (
    query &&
    ![notification.title, notification.orderId, notification.module].some((field) =>
      field.toLowerCase().includes(query),
    )
  ) {
    return false;
  }
  if (filters.module !== 'all' && notification.module !== filters.module) return false;
  if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
  if (filters.state !== 'all' && notificationState(notification) !== filters.state) return false;
  return true;
}

function compare(a: AppNotification, b: AppNotification, key: string): number {
  switch (key) {
    case 'priority':
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case 'title':
      return a.title.localeCompare(b.title);
    case 'module':
      return a.module.localeCompare(b.module);
    case 'order':
      return a.orderId.localeCompare(b.orderId);
    case 'status':
      return notificationState(a).localeCompare(notificationState(b));
    default:
      return a.timestamp.localeCompare(b.timestamp);
  }
}

export default function Notifications() {
  const navigate = useNavigate();

  const { notifications: items, unreadCount, markRead, markAllRead } = useNotifications();
  const [filters, setFilters] = useState<NotificationFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'timestamp', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [staggerRows, setStaggerRows] = useState(true);

  const rows = useMemo(() => {
    const filtered = items.filter((notification) => matches(notification, filters));
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === 'asc' ? result : -result;
    });
  }, [items, filters, sort]);

  const kpiGroups: KpiGroup[] = useMemo(() => {
    const unread = rows.filter((notification) => !notification.read);
    const escalated = rows.filter((notification) => notification.escalated);
    const arrivedToday = rows.filter((notification) => isToday(notification.timestamp));

    return [
      {
        header: 'Unread',
        data: [
          { title: 'Notifications', value: unread.length },
          { title: 'Critical', value: unread.filter((n) => n.priority === 'Critical').length },
        ],
      },
      {
        header: 'Escalated',
        data: [
          { title: 'Open', value: escalated.filter((n) => !n.read).length },
          { title: 'Acknowledged', value: escalated.filter((n) => n.read).length },
        ],
      },
      {
        header: 'Today',
        data: [
          { title: 'Received', value: arrivedToday.length },
          { title: 'Pending Action', value: arrivedToday.filter((n) => !n.read).length },
        ],
      },
      {
        header: 'Total',
        data: [
          { title: 'Notifications', value: rows.length },
          { title: 'Modules', value: new Set(rows.map((n) => n.module)).size },
        ],
      },
    ];
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const filtersActive =
    filters.query.trim() !== '' ||
    filters.module !== 'all' ||
    filters.priority !== 'all' ||
    filters.state !== 'all';

  const update = (patch: Partial<NotificationFilters>) => {
    setStaggerRows(false);
    setPage(1);
    setFilters((current) => ({ ...current, ...patch }));
  };

  const setRead = (id: string, read: boolean) => {
    setStaggerRows(false);
    markRead(id, read);
  };

  const open = (notification: AppNotification) => {
    setRead(notification.id, true);
    navigate(notificationTarget(notification));
  };

  const columns: Column<AppNotification>[] = [
    {
      key: 'priority',
      header: 'Priority',
      width: '120px',
      sortable: true,
      render: (notification) => (
        <span className="flex items-center gap-1.5 text-[13px] leading-5 font-semibold text-ink-700">
          <span
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: PRIORITY_COLOR[notification.priority] }}
          />
          {notification.priority}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Notification',
      sortable: true,
      render: (notification) => (
        <span className="flex min-w-0 flex-col">
          <span
            className={`truncate text-[14px] leading-5 ${
              notification.read ? 'font-medium text-ink-700' : 'font-bold text-ink-900'
            }`}
            title={notification.title}
          >
            {notification.title}
          </span>
          {notification.description && (
            <span className="truncate text-[12.5px] leading-[18px] text-ink-600">{notification.description}</span>
          )}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Source Module',
      width: '160px',
      sortable: true,
      render: (notification) => (
        <Badge size="xs" tone="neutral">
          {notification.module}
        </Badge>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      width: '120px',
      sortable: true,
      render: (notification) => (
        <span className="text-[14px] leading-5 font-semibold text-ink-800">{notification.orderId}</span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Received',
      width: '180px',
      sortable: true,
      render: (notification) => {
        const date = new Date(notification.timestamp);
        return (
          <span className="text-[14px] leading-5 font-semibold tabular-nums text-ink-800">
            {formatDate(date)} · {formatTime(date)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      sortable: true,
      render: (notification) => {
        const state = notificationState(notification);
        return (
          <Badge size="sm" tone={STATE_TONE[state]} pulse={state === 'Escalated'}>
            {state}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
      align: 'right',
      render: (notification) => (
        <Button
          variant="icon"
          size="sm"
          aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
          title={notification.read ? 'Mark as unread' : 'Mark as read'}
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            setRead(notification.id, !notification.read);
          }}
        >
          {notification.read ? <Mail size={16} strokeWidth={2.2} /> : <MailOpen size={16} strokeWidth={2.2} />}
        </Button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Notifications"
            breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Notifications' }]}
            actions={
              <Button
                icon={<CheckCheck size={16} strokeWidth={2.2} />}
                disabled={unreadCount === 0}
                className="cursor-pointer"
                onClick={() => {
                  setStaggerRows(false);
                  markAllRead();
                }}
              >
                Mark All Read
              </Button>
            }
          />
        </div>

        <div
          className="tsy animate-rise grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
          style={{ animationDelay: '60ms' }}
        >
          {kpiGroups.map((group) => (
            <KpiGroupCard key={group.header} group={group} />
          ))}
        </div>

        <div
          className="animate-rise flex flex-wrap items-end justify-between gap-4"
          style={{ animationDelay: '90ms' }}
        >
          <div className="flex flex-wrap items-end gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Module</span>
              <Select
                ariaLabel="Filter by source module"
                value={filters.module}
                options={MODULE_OPTIONS}
                onChange={(value) => update({ module: value })}
                className="w-[180px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Priority</span>
              <Select
                ariaLabel="Filter by priority"
                value={filters.priority}
                options={PRIORITY_OPTIONS}
                onChange={(value) => update({ priority: value })}
                className="w-[170px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Status</span>
              <Select
                ariaLabel="Filter by status"
                value={filters.state}
                options={STATE_OPTIONS}
                onChange={(value) => update({ state: value })}
                className="w-[170px]"
              />
            </label>
            <Button
              icon={<RotateCcw size={16} strokeWidth={2.2} />}
              disabled={!filtersActive}
              className="cursor-pointer"
              onClick={() => {
                setStaggerRows(false);
                setPage(1);
                setFilters(EMPTY_FILTERS);
              }}
            >
              Reset Filters
            </Button>
          </div>

          <SearchInput
            value={filters.query}
            onChange={(value) => update({ query: value })}
            placeholder="Search notification, order, or module"
            className="w-[280px]"
          />
        </div>

        <div className="glass-raised animate-rise" style={{ animationDelay: '120ms' }}>
          <DataTable
            surface={false}
            columns={columns}
            rows={pageRows}
            rowKey={(notification) => notification.id}
            onRowClick={open}
            sort={sort}
            onSortChange={(next) => {
              setStaggerRows(false);
              setPage(1);
              setSort(next);
            }}
            stagger={staggerRows}
            minWidth="1180px"
            bodyKey={`${filters.query}-${filters.module}-${filters.priority}-${filters.state}-${sort.key}-${sort.dir}-${page}`}
            emptyState={
              <EmptyState
                icon={<BellOff size={22} strokeWidth={2.1} />}
                title="No notifications match these filters"
                description="Try clearing the search or resetting the filters."
              />
            }
            footer={
              <Pagination
                variant="entries"
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={rows.length}
                onPageChange={(next) => {
                  setStaggerRows(false);
                  setPage(next);
                }}
                onPageSizeChange={(next) => {
                  setStaggerRows(false);
                  setPage(1);
                  setPageSize(next);
                }}
              />
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
