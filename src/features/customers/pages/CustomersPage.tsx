import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useCustomers } from '../customers.hooks';
import CustomerStatusBadge from '../components/CustomerStatusBadge';
import { Link } from 'react-router-dom';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({ page, pageSize: 10, search, status });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link to="/customers/create" className="inline-flex items-center px-3 py-1 border rounded bg-blue-50">
          <Plus className="w-4 h-4 mr-2" /> Create
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center border rounded px-2">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name" className="p-2 outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="p-2 border rounded">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="bg-white shadow rounded">
        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center">No customers found.</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Whatsapp</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Loyalty</th>
                <th className="p-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><Link to={`/customers/${c.id}`}>{c.fullName}</Link></td>
                  <td className="p-3">{c.whatsapp}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3"><CustomerStatusBadge status={c.status} /></td>
                  <td className="p-3">{c.loyaltyPoints}</td>
                  <td className="p-3">{new Date(c.registeredAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>Showing {items.length} of {total}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
