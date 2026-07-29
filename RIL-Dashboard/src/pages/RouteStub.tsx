import { Link, useLocation, useParams } from 'react-router-dom';

interface RouteStubProps {
  title?: string;
}

export default function RouteStub({ title }: RouteStubProps) {
  const { id } = useParams();
  const location = useLocation();
  const heading = title ?? id ?? location.pathname;

  return (
    <div className="app-gradient-bg flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{id ? 'Order Detail' : 'Page'}</p>
        <h1 className="mt-2 text-lg font-semibold text-ink">{heading}</h1>
        <p className="mt-2 text-sm text-ink-muted">This page isn&apos;t built yet.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
