import { WarehouseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

const STATUS_MESSAGES = [
  'Connecting to vendor services...',
  'Loading procurement data...',
  'Synchronizing contracts...',
  'Preparing dashboards...',
  'Finalizing startup...',
];

const PROGRESS_DURATION = 3000;
const EXIT_DURATION = 500;
const FADE_IN_DURATION = 500;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const [statusIndex, setStatusIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount entrance
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Progress bar animation
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let exitTimer = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / PROGRESS_DURATION, 1);
      // ease-in-out
      const eased = pct < 0.5 ? 2 * pct * pct : 1 - Math.pow(-2 * pct + 2, 2) / 2;
      setProgress(eased * 100);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        exitTimer = window.setTimeout(() => setExiting(true), 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
    };
  }, []);

  // Dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Status cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Exit handling
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      onComplete?.();
    }, EXIT_DURATION);
    return () => clearTimeout(t);
  }, [exiting, onComplete]);

  const dots = '.'.repeat(dotCount);

  return (
    <>
      <style>{`
        @keyframes ls-blob-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes ls-blob-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.08); }
        }
        @keyframes ls-blob-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 50px) scale(1.12); }
        }
        @keyframes ls-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ls-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes ls-status-fade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: exiting ? 'none' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #0F172A 0%, #172554 50%, #1E293B 100%)',
          fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity ${EXIT_DURATION}ms ease-in-out, transform ${FADE_IN_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          ...(exiting ? { opacity: 0 } : {}),
          overflow: 'hidden',
        }}
      >
        {/* Soft blue tint overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Blurred gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '12%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.18)',
            filter: 'blur(180px)',
            animation: 'ls-blob-1 18s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '55%',
            right: '10%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.14)',
            filter: 'blur(180px)',
            animation: 'ls-blob-2 20s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '40%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.10)',
            filter: 'blur(180px)',
            animation: 'ls-blob-3 16s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Faint engineering grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'linear-gradient(to right, #60A5FA 1px, transparent 1px), linear-gradient(to bottom, #60A5FA 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        {/* Center content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 24px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 24,
              lineHeight: 1,
              boxShadow: '0 8px 28px rgba(79, 70, 229, 0.45), 0 0 40px rgba(99, 102, 241, 0.25)',
              animation: 'ls-float 4s ease-in-out infinite',
              transform: mounted ? 'scale(1)' : 'scale(0.95)',
              transition: `transform ${FADE_IN_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          >
            <WarehouseIcon size={20} strokeWidth={2.2} />
          </div>

          {/* Title */}
          {/* <h1
            style={{
              margin: '20px 0 0 0',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 700,
              fontSize: 30,
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
            }}
          >
            Vendor Management System
          </h1> */}

          {/* Subtitle */}
          <p
            style={{
              margin: '8px 0 0 0',
              fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 500,
              fontSize: 16,
              color: '#94A3B8',
            }}
          >
            Preparing Vendor Dashboard...
          </p>

          {/* Progress bar */}
          <div
            style={{
              marginTop: 32,
              width: 320,
              height: 8,
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 50%, #8B5CF6 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                  animation: 'ls-shimmer 1.6s linear infinite',
                }}
              />
            </div>
          </div>

          {/* Loading text with dots */}
          <p
            style={{
              margin: '20px 0 0 0',
              fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#CBD5E1',
              height: 20,
            }}
          >
            Loading Dashboard{dots}
          </p>

          {/* Status text */}
          <p
            style={{
              margin: '6px 0 0 0',
              fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 400,
              fontSize: 13,
              color: '#64748B',
              height: 18,
            }}
          >
            <span
              key={statusIndex}
              style={{
                display: 'inline-block',
                animation: 'ls-status-fade 400ms ease-out',
              }}
            >
              {STATUS_MESSAGES[statusIndex]}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
