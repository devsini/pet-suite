import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account and personal details." />
      <Card className="p-6">
        <div className="space-y-3">
          <div className="text-sm text-slate-700 dark:text-slate-300">Full name</div>
          <div className="text-lg font-medium">{user?.fullName ?? '—'}</div>
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">Email</div>
          <div className="text-sm">{user?.email ?? '—'}</div>
        </div>
      </Card>
    </div>
  );
}
