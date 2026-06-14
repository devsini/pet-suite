import * as React from 'react';
import { EmptyState } from './EmptyState';
import { Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (record: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  filtersSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
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
  filtersSlot,
  actionsSlot,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.'
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <Skeleton width="30%" height="1.25rem" />
              <Skeleton width="15%" height="1.25rem" />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState icon={Loader2} title={emptyTitle} description={emptyDescription} action={actionsSlot ?? null} />;
  }

  return (
    <div className="space-y-4">
      {(filtersSlot || actionsSlot) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{filtersSlot}</div>
          <div>{actionsSlot}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeader key={column.key} style={column.width ? { width: column.width } : undefined}>
                  <div
                    className={
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }
                  >
                    {column.header}
                  </div>
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((record) => (
              <TableRow
                key={record.id}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={onRowClick ? () => onRowClick(record) : undefined}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${record.id}-${column.key}`}
                    className={
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.render ? column.render(record) : (record as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-card dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span>
            Page {pagination.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= totalPages} onClick={() => onPageChange(pagination.page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}