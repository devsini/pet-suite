import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '../appointments.types';

export default function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { color: string; icon: any; label: string }> = {
    scheduled: { color: 'text-blue-600 bg-blue-50', icon: Clock, label: 'scheduled' },
    checked_in: { color: 'text-yellow-700 bg-yellow-50', icon: Clock, label: 'checked_in' },
    in_consultation: { color: 'text-indigo-600 bg-indigo-50', icon: CheckCircle, label: 'in_consultation' },
    completed: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'completed' },
    cancelled: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'cancelled' }
  };
  const cfg = map[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded ${cfg.color} text-sm font-medium`}>
      <Icon className="w-4 h-4 mr-1" />
      {cfg.label}
    </span>
  );
}
