import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Quick access to clinic performance and activity." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6">Dashboard card content</Card>
        <Card className="space-y-4 p-6">Dashboard card content</Card>
        <Card className="space-y-4 p-6">Dashboard card content</Card>
      </div>
    </div>
  );
}

