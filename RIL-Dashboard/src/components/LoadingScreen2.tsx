import { useEffect, useState } from 'react';

interface LoadingScreen2Props {
  onComplete?: () => void;
}

const DRIVE_DURATION = 3200;
const EXIT_DELAY = 150;
const CURTAIN_DURATION = 2000;

export default function LoadingScreen2({ onComplete }: LoadingScreen2Props) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, DRIVE_DURATION + EXIT_DELAY);

    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, DRIVE_DURATION + EXIT_DELAY + CURTAIN_DURATION);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes loading2-drift-title {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(34px, -22px, 0) scale(1.06); }
        }

        @keyframes loading2-drift-forklift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-38px, 24px, 0) scale(1.05); }
        }

        @keyframes loading2-drive {
          0% { transform: translate3d(calc(100vw + 80px), 0, 0); }
          100% { transform: translate3d(-560px, 0, 0); }
        }

        @keyframes loading2-suspension {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-0.2deg); }
          50% { transform: translate3d(0, -2px, 0) rotate(0.2deg); }
        }

        @keyframes loading2-shadow {
          0%, 100% { transform: translate3d(-50%, 0, 0) scaleX(1) scaleY(1); opacity: .22; }
          50% { transform: translate3d(-50%, 0, 0) scaleX(.94) scaleY(.86); opacity: .16; }
        }

        .loading2-screen {
          background:
            radial-gradient(circle at 86% 14%, rgba(59, 130, 246, .18), transparent 34%),
            radial-gradient(circle at 12% 82%, rgba(139, 92, 246, .12), transparent 36%),
            linear-gradient(180deg, #08111f 0%, #0f172a 35%, #132238 65%, #172554 100%);
        }

        .loading2-grid {
          background-image:
            linear-gradient(rgba(248, 250, 252, .85) 1px, transparent 1px),
            linear-gradient(90deg, rgba(248, 250, 252, .85) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .loading2-light {
          filter: blur(180px);
          will-change: transform;
        }

        .loading2-light-title {
          animation: loading2-drift-title 19s ease-in-out infinite;
        }

        .loading2-light-forklift {
          animation: loading2-drift-forklift 20s ease-in-out infinite;
        }

        .loading2-floor {
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, .14) 18%, rgba(191, 219, 254, .20) 50%, rgba(255, 255, 255, .14) 82%, transparent 100%);
          box-shadow: 0 18px 58px rgba(15, 23, 42, .78), 0 2px 18px rgba(96, 165, 250, .10);
        }

        .loading2-vehicle-track {
          animation: loading2-drive ${DRIVE_DURATION}ms linear forwards;
          will-change: transform;
        }

        .loading2-vehicle-shell {
          will-change: transform;
          animation: loading2-suspension 900ms ease-in-out infinite;
        }

        .loading2-spotlight {
          background: radial-gradient(circle, rgba(99, 102, 241, .22) 0%, rgba(59, 130, 246, .09) 38%, transparent 70%);
          filter: blur(10px);
          transform: translate3d(-50%, 0, 0);
        }

        .loading2-headlight {
          background: linear-gradient(270deg, rgba(255, 255, 255, .05), rgba(255, 255, 255, 0));
          clip-path: polygon(0 0, 100% 37%, 100% 63%, 0 100%);
          filter: blur(10px);
          transform: translate3d(0, 0, 0);
        }

        .loading2-shadow {
          filter: blur(16px);
          animation: loading2-shadow 900ms ease-in-out infinite;
          will-change: transform, opacity;
        }

        .loading2-vehicle {
          transform: translate3d(0, 0, 0);
          filter: drop-shadow(0 18px 45px rgba(0, 0, 0, .30));
        }

        @media (prefers-reduced-motion: reduce) {
          .loading2-light,
          .loading2-vehicle-track,
          .loading2-vehicle-shell,
          .loading2-shadow {
            animation-duration: 1ms;
            animation-iteration-count: 1;
          }

          .loading2-curtain {
            transition-duration: 1ms;
          }
        }
      `}</style>

      <div
        className={`loading2-screen loading2-curtain fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden font-sans text-slate-50 transition-transform duration-[680ms] ease-[cubic-bezier(.16,1,.3,1)] ${
          isExiting ? 'pointer-events-none -translate-x-full' : 'translate-x-0'
        }`}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="loading2-grid pointer-events-none absolute inset-0 opacity-[.03]" />
        <div className="loading2-light loading2-light-title pointer-events-none absolute top-[8%] left-1/2 aspect-square w-[min(46vw,560px)] -translate-x-1/2 rounded-full bg-blue-400 opacity-10" />
        <div className="loading2-light loading2-light-forklift pointer-events-none absolute right-[10%] bottom-[28%] aspect-square w-[min(46vw,560px)] rounded-full bg-violet-500 opacity-10" />

        <header className="absolute top-[clamp(36px,9vh,76px)] left-1/2 z-[2] w-[min(92vw,720px)] -translate-x-1/2 text-center max-[560px]:top-12">
          <h1 className="m-0 text-[clamp(28px,4vw,34px)] leading-[1.15] font-bold text-slate-50">
            Vendor Management System
          </h1>
          <p className="mt-3 mb-0 text-base leading-6 font-medium text-slate-400 max-[560px]:text-[15px]">
            Initializing Vendor Portal...
          </p>
        </header>

        <div className="pointer-events-none absolute inset-x-0 top-[75vh] z-[1] h-[150px] -translate-y-1/2 max-[900px]:top-[58vh] max-[560px]:top-[60vh]">
          <div className="loading2-floor absolute inset-x-0 bottom-[30px] h-0.5" aria-hidden="true" />
          <div className="loading2-vehicle-track absolute inset-x-0 bottom-[38px] z-[3] h-[clamp(220px,31vw,330px)] max-[900px]:h-[230px] max-[560px]:h-[160px]">
            <div className="loading2-vehicle-shell absolute bottom-0 left-0 w-[clamp(420px,34vw,480px)] max-[900px]:w-[380px] max-[560px]:w-[240px]">
              {/* <div
                className="loading2-spotlight pointer-events-none absolute bottom-[-20px] left-1/2 h-[420px] w-[420px] rounded-full max-[560px]:h-[300px] max-[560px]:w-[300px]"
                aria-hidden="true"
              /> */}
              <div
                className="loading2-headlight pointer-events-none absolute bottom-[18%] left-[-26%] h-[38%] w-[42%]"
                aria-hidden="true"
              />
              <div
                className="loading2-shadow absolute bottom-[-10px] left-1/2 h-[26px] w-[74%] rounded-full bg-slate-950/90"
                aria-hidden="true"
              />
              <img
                className="loading2-vehicle relative z-[2] block h-auto w-full select-none"
                src="/Logistics.svg"
                alt=""
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
