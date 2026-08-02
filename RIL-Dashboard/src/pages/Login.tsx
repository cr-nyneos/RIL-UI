import { useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import TextField from '../components/ui/TextField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const DEMO_EMAIL = 'admin@gmail.com';
const DEMO_PASSWORD = 'admin123';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-6 lg:flex-[0_0_46%] lg:px-16"
        style={{
          background:
            'linear-gradient(155deg, #dfe1f7 0%, #eef0fb 30%, #f4f5fa 55%, #e9e7fa 80%, #ded9f6 100%)',
        }}
      >
        <div className={`relative z-10 w-full max-w-[370px] ${shake ? 'is-error' : ''}`}>
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
             Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              inputMode="email"
              placeholder={DEMO_EMAIL}
              value={email}
              onChange={handleEmailChange}
              error={error}
              size="lg"
              className="mb-[7px]"
            />

            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="login-password" className="block text-[13px] font-semibold text-ink-700">
                Password
              </label>
              <button
                type="button"
                className="cursor-pointer text-[13px] font-medium text-slate-500 hover:text-ink-700"
              >
                Forgot password?
              </button>
            </div>

            <TextField
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={DEMO_PASSWORD}
              value={password}
              onChange={handlePasswordChange}
              error={error}
              size="lg"
              className="mb-3.5"
              trailingAction={
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="h-[30px] w-[30px] border-0 bg-transparent shadow-none"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.2} /> : <Eye size={18} strokeWidth={2.2} />}
                </Button>
              }
            />

            <div className="min-h-9" aria-live="polite">
              {error && (
                <Alert tone="danger" icon={<AlertCircle size={14} strokeWidth={2.4} />}>
                  Incorrect email or password.
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              className="mb-4 h-14 cursor-pointer text-[17px]"
            >
              {submitting ? 'Signing in...' : 'SIGN IN'}
            </Button>

            <p className="mb-4 text-center text-[13px] font-normal text-slate-400">
              Demo credentials — {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-[13px] font-normal text-slate-400">or</span>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <button
              type="button"
              className="mb-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-input)] text-[15px] font-semibold text-ink-900"
            >
              <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-[14px] font-normal text-slate-500">
              Don&apos;t have an account?{' '}
              <button type="button" className="cursor-pointer font-semibold text-ink-900">
                Sign up
              </button>
            </p>

            <p className="mt-3 text-center text-[12px] leading-5 font-normal text-slate-400">
              By continuing, you agree to our{' '}
              <button type="button" className="cursor-pointer underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="cursor-pointer underline">
                Privacy &amp; Cookie Policy
              </button>
              .
            </p>
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