import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function PetsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pets" description="Track pets, species, breeds, and active care plans." />
      <Card className="p-6">Pet management content will be available here.</Card>
    </div>
  );
}
