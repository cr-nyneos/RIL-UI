import { Link, useLocation, useParams } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

interface RouteStubProps {
  title?: string;
}

export default function RouteStub({ title }: RouteStubProps) {
  const { id } = useParams();
  const location = useLocation();
  const heading = title ?? id ?? location.pathname;

  return (
    <AppShell>
      <EmptyState
        icon={<FileQuestion size={24} strokeWidth={2.1} />}
        title={heading}
        description={id ? 'Order detail is not built yet.' : 'This page is not built yet.'}
        action={
          <Button as={Link} to="/" variant="link">
            Back to Dashboard
          </Button>
        }
      />
    </AppShell>
  );
}
