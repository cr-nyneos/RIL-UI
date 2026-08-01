import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { VENDOR_OPS_HEALTH } from '../../lib/mockData/dashboard';

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OperationsSummaryCard() {
  const { score, band, summary, metrics } = VENDOR_OPS_HEALTH;
  const dash = (score / 100) * CIRCUMFERENCE;

  return (
    <div className="dash-ops relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-6 px-6 py-6 sm:px-7">
        <div className="dash-ops-ring relative flex h-[86px] w-[86px] flex-none items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#D3E2FA" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r={RADIUS}
              fill="none"
              stroke="var(--color-brand-600)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            />
          </svg>
          <span className="relative flex flex-col items-center">
            <span className="text-[22px] leading-6 font-bold tabular-nums tracking-[-0.02em] text-brand-800">
              {score}
            </span>
            <span className="text-[9px] leading-3 font-bold tracking-[0.12em] text-ink-500 uppercase">Score</span>
          </span>
        </div>

        <div className="min-w-[16rem] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-[11px] leading-4 font-bold tracking-[0.12em] text-brand-700 uppercase">
              <ShieldCheck size={13} strokeWidth={2.4} />
              Vendor Operations Health
            </span>
            <span className="dash-ops-band rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em] uppercase">
              {band}
            </span>
          </div>
          <p className="mt-2 max-w-[58ch] text-[13.5px] leading-5 font-medium text-ink-600">{summary}</p>
        </div>

        <Button
          as={Link}
          to="/orders"
          variant="primary"
          size="md"
          icon={<ArrowRight size={16} />}
          iconPosition="right"
          className="flex-none"
        >
          Review Exceptions
        </Button>
      </div>

      <div className="dash-ops-metrics grid grid-cols-2 gap-px lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="dash-ops-metric px-6 py-4 sm:px-7">
            <p className="text-[10.5px] leading-4 font-bold tracking-[0.1em] text-ink-500 uppercase">{m.label}</p>
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[21px] leading-7 font-bold tabular-nums tracking-[-0.02em] text-ink-900">
                {m.value}
              </span>
              <span className="text-[11.5px] font-semibold text-ink-500">{m.caption}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
