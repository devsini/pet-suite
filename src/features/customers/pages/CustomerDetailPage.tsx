import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer } from '../customers.hooks';
import LoyaltyPointsCard from '../components/LoyaltyPointsCard';
import CustomerStatusBadge from '../components/CustomerStatusBadge';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useCustomer(id);
  const [tab, setTab] = useState<'overview'|'pets'|'history'|'invoices'|'activity'>('overview');

  const customer = data as any;

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Customer</div>
          <h1 className="text-2xl font-semibold">{customer.fullName}</h1>
          <div className="mt-2"><CustomerStatusBadge status={customer.status} /></div>
        </div>
        <div className="flex gap-2">
          <Link to={`/customers/${id}/edit`} className="inline-flex items-center px-3 py-1 border rounded">Edit</Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 border-b">
          <button onClick={() => setTab('overview')} className={`py-2 ${tab==='overview'?'border-b-2':''}`}>Overview</button>
          <button onClick={() => setTab('pets')} className={`py-2 ${tab==='pets'?'border-b-2':''}`}>Pets</button>
          <button onClick={() => setTab('history')} className={`py-2 ${tab==='history'?'border-b-2':''}`}>Medical History</button>
          <button onClick={() => setTab('invoices')} className={`py-2 ${tab==='invoices'?'border-b-2':''}`}>Invoices</button>
          <button onClick={() => setTab('activity')} className={`py-2 ${tab==='activity'?'border-b-2':''}`}>Activity</button>
        </div>

        <div className="mt-4">
          {tab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Contact</div>
                <div className="mt-2">Whatsapp: {customer.whatsapp}</div>
                <div>Email: {customer.email}</div>
                <div className="mt-4"><strong>Registered:</strong> {new Date(customer.registeredAt).toLocaleString()}</div>
              </div>
              <div className="p-4 border rounded">
                <LoyaltyPointsCard customerId={customer.id} points={customer.loyaltyPoints} />
              </div>
            </div>
          )}

          {tab === 'pets' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Pets</h3>
                <Link to={`/pets/create?owner=${customer.id}`} className="px-3 py-1 border rounded">Add Pet</Link>
              </div>
              <div>Loading pets...</div>
            </div>
          )}

          {tab === 'history' && <div>Medical history timeline (placeholder)</div>}
          {tab === 'invoices' && <div>Invoices table (placeholder)</div>}
          {tab === 'activity' && <div>Activity log (placeholder)</div>}
        </div>
      </div>
    </div>
  );
}
