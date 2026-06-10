import * as React from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, variant = 'default', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'default'} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
