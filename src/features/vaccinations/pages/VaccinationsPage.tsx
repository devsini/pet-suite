import React, { useState, useMemo } from 'react';
import { Search, Plus, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input } from '@/components/ui';
import { useVaccinationRecords } from '../vaccinations.hooks';

export default function VaccinationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useVaccinationRecords({ page, pageSize: 10, search });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      { key: 'dateAdministered', title: 'Date', render: (record: any) => new Date(record.dateAdministered).toLocaleDateString() },
      { key: 'petId', title: 'Pet ID' },
      { key: 'vaccineName', title: 'Vaccine' },
      { key: 'nextDue', title: 'Next Due', render: (record: any) => record.nextDue ? new Date(record.nextDue).toLocaleDateString() : 'N/A' },
      { key: 'veterinarianId', title: 'Veterinarian' }
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Vaccinations"
        description="Track vaccine history, due dates and certificates for pets."
        actions={
          <Button onClick={() => navigate('/staff/vaccinations/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Vaccination
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
            placeholder="Search by vaccine or pet ID"
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
        onRowClick={(record) => navigate(`/staff/vaccinations/${record.id}`)}
        emptyTitle="No vaccination records found"
        emptyDescription="Add a new entry or refine your search."
      />
    </div>
  );
}
