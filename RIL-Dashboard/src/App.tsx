import { motion } from 'framer-motion';
import { Activity, Waves, PieChart as PieIcon, Waypoints } from 'lucide-react';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import LineChart from './components/LineChart';

const card = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 18, mass: 0.9 },
  },
};

const eyebrowIcon = { marginRight: 6, verticalAlign: '-1px', color: 'var(--text-1)' } as const;

function App() {
  return (
    <div className="relative z-[1] mx-auto max-w-[1240px] px-[clamp(18px,4vw,48px)] pt-[clamp(32px,6vw,72px)] pb-[80px]">
      <header className="mb-[clamp(28px,5vw,52px)] text-center">
        <motion.span
          className="inline-flex items-center gap-[7px] rounded-full border border-[var(--border)] bg-white/[0.035] px-[14px] py-[6px] text-[12px] font-semibold tracking-[0.02em] text-[var(--text-1)] backdrop-blur-[10px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Activity size={13} strokeWidth={2.4} style={{ color: 'var(--cyan)' }} />
          FY24 · Live segment analytics
        </motion.span>

        <h1 className="mt-[20px] mb-0 bg-[linear-gradient(180deg,#ffffff_30%,#a9b4cc_100%)] bg-clip-text text-[clamp(38px,6.5vw,66px)] font-bold leading-[1.02] text-transparent">
          Reliance Dashboard
        </h1>

        <motion.p
          className="mx-auto mt-[16px] max-w-[560px] text-[clamp(14px,2vw,16px)] leading-[1.55] text-[var(--text-2)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          Consolidated revenue performance across Reliance Industries' operating segments.
        </motion.p>
      </header>

      <div className="mx-auto flex max-w-[880px] flex-col gap-[clamp(40px,7vw,88px)]">
        {/* Pie chart section */}
        <motion.section
          className="glass-card"
          variants={card}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
            <div>
              <div className="card-eyebrow">
                <PieIcon size={12} style={eyebrowIcon} />
                Revenue mix
              </div>
              <h2 className="card-title">Portfolio Split</h2>
              <p className="card-sub">Hover a slice to expand the breakdown</p>
            </div>
            <span className="unit-pill">FY24</span>
          </div>
          <PieChart />
        </motion.section>

        {/* Bar chart section */}
        <motion.section
          className="glass-card"
          variants={card}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
            <div>
              <div className="card-eyebrow">
                <Waves size={12} style={eyebrowIcon} />
                Revenue by segment
              </div>
              <h2 className="card-title">Segment Contribution</h2>
              <p className="card-sub">Hover a vessel to disturb the liquid &amp; read its trend</p>
            </div>
            <span className="unit-pill">USD · Billions</span>
          </div>
          <BarChart />
        </motion.section>

        {/* Line chart section */}
        <motion.section
          className="glass-card"
          variants={card}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
            <div>
              <div className="card-eyebrow">
                <Waypoints size={12} style={eyebrowIcon} />
                Revenue flow
              </div>
              <h2 className="card-title">Monthly Momentum</h2>
              <p className="card-sub">Hover the current to read each month &amp; disturb the water</p>
            </div>
            <span className="unit-pill">FY24 · USD B</span>
          </div>
          <LineChart />
        </motion.section>
      </div>
    </div>
  );
}

export default App;
