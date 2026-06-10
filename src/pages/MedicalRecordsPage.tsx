import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';

export function MedicalRecordsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Medical Records" description="Access pet medical history, treatments, and lab results." />
      <Card className="p-6">Medical records will be accessible here.</Card>
    </div>
  );
}
