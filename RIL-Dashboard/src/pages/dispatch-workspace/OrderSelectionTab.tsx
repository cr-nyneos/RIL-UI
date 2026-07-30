import { CheckCircle2, PackageSearch, Search } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import SearchInput from '../../components/ui/SearchInput';
import TypeBadge from '../../components/ui/TypeBadge';
import { formatExpected, formatValue } from '../../lib/orderFilters';
import type { Order } from '../../lib/types/order';
import { STEP_COPY } from './constants';

interface OrderSelectionTabProps {
  query: string;
  setQuery: (value: string) => void;
  orders: Order[];
  selectedOrderId: string;
  onSelect: (order: Order) => void;
}

export default function OrderSelectionTab({ query, setQuery, orders, selectedOrderId, onSelect }: OrderSelectionTabProps) {
  return (
    <GlassCard key="order" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={Search} {...STEP_COPY.order} pill={`${orders.length}`} />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search order, PO, or vendor"
        className="mb-5 w-full"
      />
      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={22} strokeWidth={2.1} />}
          title="No orders match this search"
          description="Clear the search to see every open order."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {orders.map((order) => {
            const selected = order.id === selectedOrderId;
            const expected = formatExpected(order.expected, order.progress >= 100);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelect(order)}
                className={`glass-inset flex min-h-[136px] cursor-pointer flex-col justify-between p-5 text-left transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)] ${
                  selected ? 'bg-[var(--wash-brand-active)] shadow-[inset_0_0_0_1px_var(--color-glass-hairline-deep)]' : ''
                }`}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-body-strong">{order.id}</span>
                    <span className="block truncate text-meta">{order.po}</span>
                  </span>
                  {selected ? <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" /> : <TypeBadge type={order.type} />}
                </span>
                <span className="mt-4 block truncate text-body-strong" title={order.vendor}>{order.vendor}</span>
                <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta tabular-nums">
                  <span>{order.plant}</span>
                  <span>{expected.label}</span>
                  <span>{formatValue(order.valueCr)}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
