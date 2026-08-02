import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import DataTable, { type Column, type SortState } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { currentGateLabel, formatExpected, getOrderBucket } from '../../lib/orderFilters';
import type { Order } from '../../lib/types/order';
import type { VendorSnapshot } from '../../lib/vendor360';

interface OrdersTabProps {
  snapshot: VendorSnapshot;
}

function compare(a: Order, b: Order, key: string): number {
  switch (key) {
    case 'project':
      return a.po.localeCompare(b.po);
    case 'stage':
      return currentGateLabel(a).localeCompare(currentGateLabel(b));
    case 'status':
      return a.status.localeCompare(b.status);
    case 'plant':
      return a.plant.localeCompare(b.plant);
    case 'expected':
      return a.expected.localeCompare(b.expected);
    default:
      return a.id.localeCompare(b.id);
  }
}

export default function OrdersTab({ snapshot }: OrdersTabProps) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortState>({ key: 'expected', dir: 'asc' });

  const rows = useMemo(
    () =>
      [...snapshot.orders].sort((a, b) => {
        const result = compare(a, b, sort.key);
        return sort.dir === 'asc' ? result : -result;
      }),
    [snapshot.orders, sort],
  );

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: '130px',
      sortable: true,
      render: (order) => <span className="text-body-strong tabular-nums">{order.id}</span>,
    },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (order) => <span className="text-body truncate">{order.po}</span>,
    },
    {
      key: 'stage',
      header: 'Current Stage',
      width: '220px',
      sortable: true,
      render: (order) => <span className="text-body truncate">{currentGateLabel(order)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '150px',
      render: (order) => <StatusBadge status={order.status} size="sm" />,
    },
    {
      key: 'plant',
      header: 'Plant',
      width: '140px',
      sortable: true,
      render: (order) => <span className="text-body truncate">{order.plant}</span>,
    },
    {
      key: 'expected',
      header: 'Expected Completion',
      width: '190px',
      sortable: true,
      render: (order) => {
        const expected = formatExpected(order.expected, getOrderBucket(order) === 'completed');
        return (
          <span className="text-body tabular-nums">
            {expected.label}
            <span className={`ml-2 text-meta ${expected.overdue ? 'font-bold' : ''}`}>{expected.relative}</span>
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      surface={false}
      minWidth="1040px"
      columns={columns}
      rows={rows}
      rowKey={(order) => order.id}
      sort={sort}
      onSortChange={setSort}
      onRowClick={(order) => navigate(`/orders/${order.id}`)}
      emptyState={
        <EmptyState
          icon={<Package size={22} strokeWidth={2.1} />}
          title="No orders for this vendor"
          description="Orders appear here once one is awarded to this vendor."
        />
      }
    />
  );
}
