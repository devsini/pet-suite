import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useMedicalRecords } from '../medical-records.hooks';
import { useDoctors } from '@/features/appointments/appointments.hooks';
import { usePagination } from '@/hooks/usePagination';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const recordTypes = ['consultation', 'follow-up', 'emergency', 'surgery'];

export default function MedicalRecordsPage() {
  useDocumentTitle('Medical Records');
  const [search, setSearch] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [doctorId, setDoctorId] = useState('');
  const { page, pageSize, onPageChange, setPage } = usePagination({ initialPage: 1, initialPageSize: 10, filterDependencies: [search, recordType, doctorId] });
  const navigate = useNavigate();

  const { data, isLoading } = useMedicalRecords({
    page,
    pageSize,
    search,
    doctorId: doctorId || undefined
  });
  const doctorsQuery = useDoctors('');
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        render: (record: any) => new Date(record.date).toLocaleDateString()
      },
      {
        key: 'recordType',
        header: 'Type',
        render: (record: any) => record.recordType ?? 'Consultation'
      },
      { key: 'petName', header: 'Pet', render: (record: any) => record.petName || record.petId },
      { key: 'doctorName', header: 'Doctor', render: (record: any) => record.doctorName || record.doctorId },
      {
        key: 'assessment',
        header: 'Assessment',
        render: (record: any) => (
          <span className="text-sm text-slate-600">{record.soap?.assessment?.slice(0, 60) || record.notes?.slice(0, 60) || 'No summary'}</span>
        )
      },
      {
        key: 'attachments',
        header: 'Uploads',
        render: (record: any) => record.attachments?.length ?? 0
      }
    ],
    []
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Medical Records"
        description="Review SOAP notes, prescriptions, and attachments for each pet visit."
        actions={
          <Button onClick={() => navigate('/doctor/medical-records/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              onPageChange(1);
            }}
            placeholder="Search patient, pet or doctor"
            className="border-0 px-0 ring-0 focus:ring-0"
          />
        </div>
        <Select value={recordType} onValueChange={(value) => setRecordType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {recordTypes.map((type) => (
              <SelectItem key={type} value={type}>{type.replace('-', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={doctorId} onValueChange={(value) => setDoctorId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Doctors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Doctors</SelectItem>
            {(doctorsQuery.data || []).map((doctor: any) => (
              <SelectItem key={doctor.id} value={doctor.id}>{doctor.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        pagination={{ page, pageSize: 10, total }}
        onPageChange={(nextPage) => setPage(nextPage)}
        onRowClick={(record) => navigate(`/doctor/medical-records/${record.id}`)}
        emptyTitle="No medical records found"
        emptyDescription="Create a new medical record or adjust the search filter."
      />
    </div>
  );
}
