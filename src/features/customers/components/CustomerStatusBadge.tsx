import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import type { CustomerStatus } from '../customers.types';

interface Props { status: CustomerStatus }

export default function CustomerStatusBadge({ status }: Props) {
  const color = status === 'active' ? 'text-green-600 bg-green-100' : status === 'inactive' ? 'text-gray-600 bg-gray-100' : 'text-red-600 bg-red-100';
  const Icon = status === 'active' ? UserCheck : UserX;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded ${color} text-sm font-medium`}>
      <Icon className="w-4 h-4 mr-1" />
      {status}
    </span>
  );
}
