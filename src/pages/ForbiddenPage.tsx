import { Button, Card } from '@/components/ui';
import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-xl">
        <Card className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">403</p>
            <h1 className="text-3xl font-semibold">Access denied</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view this page. Please contact your administrator if you think this is an error.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="default">Return to dashboard</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
