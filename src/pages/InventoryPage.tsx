import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Review stock levels, suppliers, and inbound shipments." />
      <Card className="p-6">Inventory tracking will be added soon.</Card>
    </div>
  );
}
