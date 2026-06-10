import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer records and communication." />
      <Card className="p-6">Customer list will appear here.</Card>
    </div>
  );
}
