import { useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check, WarehouseIcon } from 'lucide-react';
import { Warehouse } from "lucide-react";

const DEMO_EMAIL = 'admin@gmail.com';
const DEMO_PASSWORD = 'admin123';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(false);
  };

  const handleAutofill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const ok = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
    setSubmitting(false);

    if (ok) {
      navigate('/', { replace: true });
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div className="app-canvas flex h-screen max-h-screen w-full overflow-hidden">
  <div className="flex flex-1 items-center justify-center px-6 lg:flex-[0_0_46%] lg:px-16">
        <div className={`w-full max-w-[370px] ${shake ? 'is-error' : ''}`}>
          {/* <div className="mb-12 flex items-center gap-2.5 max-[480px]:mb-8">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-violet-500))] text-sm font-extrabold text-white">
            <Warehouse size={20} strokeWidth={2.2} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-ink-900">NyneOS</span>
          </div> */}

          <div className="mb-12 text-center">
            <h1 className="mb-3 text-[34px] leading-none font-bold tracking-wide uppercase text-ink-900">
              WELCOME BACK
            </h1>
            <p className="text-[17px] leading-7 font-normal text-slate-500">
             Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-[7px]">
              <label htmlFor="login-email" className="field-label">
                Email
              </label>
              <div className="field">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={error}
                  className="field-input"
                />
                <div className="field-liquid" />
              </div>
            </div>

            <div className="mb-3.5">
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <div className="field">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-invalid={error}
                  className="field-input field-input-toggle"
                />
                <div className="field-liquid" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="field-toggle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.2} /> : <Eye size={18} strokeWidth={2.2} />}
                </button>
              </div>
            </div>

            <div className="min-h-9" aria-live="polite">
              {error && (
                <div
                  className="glass-inset flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold text-kpi-danger-text"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(244,63,94,0.08)',
                    borderColor: 'rgba(244,63,94,0.20)',
                  }}
                >
                  <AlertCircle size={14} strokeWidth={2.4} className="flex-none" />
                  Incorrect email or password.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`btn-primary mb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                submitting ? 'is-loading' : ''
              }`}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>


      <div className="hidden h-screen flex-1 lg:flex">
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ '--bloom': 'rgba(99,102,241,0.10)' } as CSSProperties}
        >
          <img
            src="/warehouse3.png"
            alt=""
            className="h-full w-full object-cover"
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(79,70,229,0.10) 0%, transparent 45%, rgba(139,92,246,0.10) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
