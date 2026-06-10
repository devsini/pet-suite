import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Process billing and payments for visits and products." />
      <Card className="p-6">Invoice management will be available here.</Card>
    </div>
  );
}
