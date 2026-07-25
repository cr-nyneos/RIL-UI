import { motion } from 'framer-motion';
import { Activity, Waves, PieChart as PieIcon } from 'lucide-react';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import './App.css';

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 20, delay: 0.1 + i * 0.12 },
  }),
};

function App() {
  return (
    <div className="dashboard">
      <header className="dash-header">
        <motion.span
          className="dash-badge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Activity size={13} strokeWidth={2.4} />
          FY24 · Live segment analytics
        </motion.span>

        {/* Existing heading — preserved */}
        <h1>Reliance Dashboard</h1>

        <motion.p
          className="dash-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          Consolidated revenue performance across Reliance Industries' operating segments.
        </motion.p>
      </header>

      <div className="dash-grid">
        <motion.section
          className="glass-card"
          custom={0}
          variants={rise}
          initial="hidden"
          animate="show"
        >
          <div className="card-head">
            <div>
              <div className="card-eyebrow">
                <Waves size={12} style={{ marginRight: 6, verticalAlign: '-1px' }} />
                Revenue by segment
              </div>
              <h2 className="card-title">Segment Contribution</h2>
              <p className="card-sub">Hover a vessel to inspect its share &amp; trend</p>
            </div>
            <span className="unit-pill">USD · Billions</span>
          </div>
          <BarChart />
        </motion.section>

        <motion.section
          className="glass-card"
          custom={1}
          variants={rise}
          initial="hidden"
          animate="show"
        >
          <div className="card-head">
            <div>
              <div className="card-eyebrow">
                <PieIcon size={12} style={{ marginRight: 6, verticalAlign: '-1px' }} />
                Revenue mix
              </div>
              <h2 className="card-title">Portfolio Split</h2>
              <p className="card-sub">Hover a slice to expand the breakdown</p>
            </div>
            <span className="unit-pill">FY24</span>
          </div>
          <PieChart />
        </motion.section>
      </div>
    </div>
  );
}

export default App;
