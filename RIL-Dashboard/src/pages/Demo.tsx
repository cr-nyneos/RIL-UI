import { motion } from 'framer-motion';
import { Activity, Waves, PieChart as PieIcon, Waypoints } from 'lucide-react';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';

const card = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 18, mass: 0.9 },
  },
};

const eyebrowIcon = { marginRight: 6, verticalAlign: '-1px', color: 'var(--color-text-1)' } as const;

const GLASS_CARD =
  'relative flex flex-col overflow-hidden rounded-[28px] border border-border bg-card p-[clamp(24px,4vw,44px)] shadow-[0_1px_0_#ffffffb3_inset,0_30px_60px_-30px_#0b0b0b26,0_12px_30px_-18px_#0b0b0b14] backdrop-blur-[28px] backdrop-saturate-150';
const CARD_EYEBROW = 'flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-text-2';
const CARD_TITLE = 'm-0 mt-1.5 font-display text-xl font-semibold tracking-[-0.02em] text-text-0';
const CARD_SUB = 'mt-1 text-[13px] text-text-2';
const UNIT_PILL =
  'flex-none whitespace-nowrap rounded-full border border-border bg-[#0b0b0b08] px-[11px] py-[5px] text-[11px] font-semibold tracking-[0.06em] text-text-1';

function Demo() {
  return (
    <>
      {/* Ambient background wash, fixed behind all content */}
      <div className="fixed inset-0 -z-10 bg-bg-0 bg-fixed bg-[radial-gradient(1200px_800px_at_12%_-10%,rgba(42,120,214,0.10),transparent_60%),radial-gradient(1000px_700px_at_100%_0%,rgba(122,58,167,0.08),transparent_55%),radial-gradient(900px_900px_at_50%_120%,rgba(27,175,122,0.07),transparent_60%)]" />
      {/* Faint grid + vignette mask over the whole page */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(11,11,11,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(11,11,11,0.035)_1px,transparent_1px)] bg-[length:46px_46px] [mask-image:radial-gradient(120%_90%_at_50%_0%,#000_30%,transparent_80%)]" />

      <div className="relative z-[1] mx-auto max-w-[1240px] px-[clamp(18px,4vw,48px)] pt-[clamp(32px,6vw,72px)] pb-[80px]">
        <header className="mb-[clamp(28px,5vw,52px)] text-center">
          <motion.span
            className="inline-flex items-center gap-[7px] rounded-full border border-border bg-white/70 px-[14px] py-[6px] text-[12px] font-semibold tracking-[0.02em] text-text-1 backdrop-blur-[10px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Activity size={13} strokeWidth={2.4} className="text-cat-1" />
            FY24 · Live segment analytics
          </motion.span>

          <h1 className="mt-[20px] mb-0 bg-[linear-gradient(180deg,#0b0b0b_30%,#52514e_100%)] bg-clip-text font-display text-[clamp(38px,6.5vw,66px)] font-bold leading-[1.02] tracking-[-0.02em] text-transparent">
            Reliance Dashboard
          </h1>

          <motion.p
            className="mx-auto mt-[16px] max-w-[560px] text-[clamp(14px,2vw,16px)] leading-[1.55] text-text-2"
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
            className={GLASS_CARD}
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
              <div>
                <div className={CARD_EYEBROW}>
                  <PieIcon size={12} style={eyebrowIcon} />
                  Revenue mix
                </div>
                <h2 className={CARD_TITLE}>Portfolio Split</h2>
                <p className={CARD_SUB}>Hover a slice to expand the breakdown</p>
              </div>
              <span className={UNIT_PILL}>FY24</span>
            </div>
            <PieChart />
          </motion.section>

          {/* Bar chart section */}
          <motion.section
            className={GLASS_CARD}
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
              <div>
                <div className={CARD_EYEBROW}>
                  <Waves size={12} style={eyebrowIcon} />
                  Revenue by segment
                </div>
                <h2 className={CARD_TITLE}>Segment Contribution</h2>
                <p className={CARD_SUB}>Hover a vessel to disturb the liquid &amp; read its trend</p>
              </div>
              <span className={UNIT_PILL}>USD · Billions</span>
            </div>
            <BarChart />
          </motion.section>

          {/* Line chart section */}
          <motion.section
            className={GLASS_CARD}
            variants={card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="mb-[clamp(20px,3vw,30px)] flex items-start justify-between gap-[16px]">
              <div>
                <div className={CARD_EYEBROW}>
                  <Waypoints size={12} style={eyebrowIcon} />
                  Revenue flow
                </div>
                <h2 className={CARD_TITLE}>Monthly Momentum</h2>
                <p className={CARD_SUB}>Hover the current to read each month &amp; disturb the water</p>
              </div>
              <span className={UNIT_PILL}>FY24 · USD B</span>
            </div>
            <LineChart />
          </motion.section>
        </div>
      </div>
    </>
  );
}

export default Demo;
