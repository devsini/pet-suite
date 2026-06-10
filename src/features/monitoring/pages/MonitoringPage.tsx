import React, { useState, useMemo } from 'react';
import { Search, Plus, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useMonitoringEntries } from '../monitoring.hooks';

export default function MonitoringPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useMonitoringEntries({ page, pageSize: 10, search });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      { key: 'date', title: 'Date', render: (record: any) => new Date(record.date).toLocaleDateString() },
      { key: 'petId', title: 'Pet ID' },
      { key: 'weightKg', title: 'Weight (kg)' },
      { key: 'medicationPlan', title: 'Medication Plan', render: (record: any) => record.medicationPlan || 'No notes' },
      { key: 'nextCheck', title: 'Next Check', render: (record: any) => record.nextCheck ? new Date(record.nextCheck).toLocaleDateString() : 'None' }
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Monitoring"
        description="Track weight, medication schedules, recovery notes, and owner uploads for active pets."
        actions={
          <Button onClick={() => navigate('/staff/monitoring/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by pet ID or medication"
            className="border-0 px-0 ring-0 focus:ring-0"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={{ page, pageSize: 10, total }}
        onPageChange={(nextPage) => setPage(nextPage)}
        onRowClick={(record) => navigate(`/staff/monitoring/${record.id}`)}
        emptyTitle="No monitoring records found"
        emptyDescription="Create an entry to track recovery and follow-up care."
      />
    </div>
  );
}
