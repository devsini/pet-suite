import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui';

export interface Column<T> {
  key: string;
  title: string;
  render?: (record: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: { page: number; pageSize: number; total: number };
  onPageChange?: (page: number) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onRowClick?: (record: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  filters,
  actions,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.'
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState icon={Loader2} title={emptyTitle} description={emptyDescription} action={actions ?? null} />;
  }

  return (
    <div className="space-y-4">
      {(filters || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{filters}</div>
          <div>{actions}</div>
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className ?? 'px-4 py-3 font-semibold'}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr
                key={record.id}
                className={onRowClick ? 'cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-900' : ''}
                onClick={onRowClick ? () => onRowClick(record) : undefined}
              >
                {columns.map((column) => (
                  <td key={`${record.id}-${column.key}`} className={column.className ?? 'px-4 py-4'}>
                    {column.render ? column.render(record) : (record as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <span>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => onPageChange(pagination.page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
