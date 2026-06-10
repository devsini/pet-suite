import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppointment, useUpdateAppointmentStatus } from '../appointments.hooks';
import AppointmentStatusBadge from '../components/AppointmentStatusBadge';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useAppointment(id);
  const mutation = useUpdateAppointmentStatus();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  async function updateStatus(status: string) {
    try {
      await mutation.mutateAsync({ id, status });
      alert('Status updated');
      window.location.reload();
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Appointment</div>
          <h1 className="text-2xl font-semibold">{data.service}</h1>
          <div className="mt-2"><AppointmentStatusBadge status={data.status} /></div>
        </div>
        <div className="flex gap-2">
          <Link to="/staff/appointments" className="px-3 py-1 border rounded">Back</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <div><strong>Pet:</strong> {data.pet_id}</div>
          <div><strong>Customer:</strong> {data.customer_id}</div>
          <div><strong>Doctor:</strong> {data.doctor_id}</div>
          <div><strong>Scheduled:</strong> {new Date(data.scheduled_at).toLocaleString()}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => updateStatus('checked_in')} className="px-3 py-1 border rounded">Check-in</button>
            <button onClick={() => updateStatus('in_consultation')} className="px-3 py-1 border rounded">Start</button>
            <button onClick={() => updateStatus('completed')} className="px-3 py-1 border rounded">Complete</button>
            <button onClick={() => updateStatus('cancelled')} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </div>
        <div className="p-4 border rounded">Notes: {data.notes}</div>
      </div>
    </div>
  );
}
