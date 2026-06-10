import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePet } from '../pets.hooks';
import { usePetVaccinations } from '@/features/vaccinations/vaccinations.hooks';
import { usePetMonitoring } from '@/features/monitoring/monitoring.hooks';
import PetQRCard from '../components/PetQRCard';

export default function PetProfilePage() {
  const { id } = useParams();
  const { data, isLoading } = usePet(id);
  const vaccinationQuery = usePetVaccinations(id);
  const monitoringQuery = usePetMonitoring(id);
  const pet = data as any;
  const [tab, setTab] = useState<'overview'|'medical'|'vaccinations'|'monitoring'|'timeline'>('overview');

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!pet) return <div className="p-6">Pet not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Pet</div>
          <h1 className="text-2xl font-semibold">{pet.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/staff/pets/${id}/edit`} className="px-3 py-1 border rounded">Edit</Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 border-b">
          <button onClick={() => setTab('overview')} className={`py-2 ${tab==='overview'?'border-b-2':''}`}>Overview</button>
          <button onClick={() => setTab('medical')} className={`py-2 ${tab==='medical'?'border-b-2':''}`}>Medical</button>
          <button onClick={() => setTab('vaccinations')} className={`py-2 ${tab==='vaccinations'?'border-b-2':''}`}>Vaccinations</button>
          <button onClick={() => setTab('monitoring')} className={`py-2 ${tab==='monitoring'?'border-b-2':''}`}>Monitoring</button>
          <button onClick={() => setTab('timeline')} className={`py-2 ${tab==='timeline'?'border-b-2':''}`}>Timeline</button>
        </div>

        <div className="mt-4">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-gray-500">Details</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Species</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Breed</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Age</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.age ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Owner</p>
                    <p className="mt-1 font-semibold text-slate-900">{pet.ownerId}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <PetQRCard petId={pet.id} />
              </div>
            </div>
          )}

          {tab === 'medical' && <div>Medical records placeholder</div>}
          {tab === 'vaccinations' && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Vaccinations</div>
                {vaccinationQuery.isLoading ? (
                  <div className="mt-4 text-sm text-slate-600">Loading vaccination history...</div>
                ) : vaccinationQuery.data?.length ? (
                  <ul className="mt-4 space-y-3">
                    {vaccinationQuery.data.map((record: any) => (
                      <li key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{record.vaccineName}</p>
                            <p className="text-sm text-slate-600">Administered {new Date(record.dateAdministered).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <p>Next due</p>
                            <p className="font-medium text-slate-900">{record.nextDue ? new Date(record.nextDue).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No vaccination history available for this pet.</div>
                )}
              </div>
            </div>
          )}
          {tab === 'monitoring' && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Monitoring</div>
                {monitoringQuery.isLoading ? (
                  <div className="mt-4 text-sm text-slate-600">Loading monitoring history...</div>
                ) : monitoringQuery.data?.length ? (
                  <ul className="mt-4 space-y-3">
                    {monitoringQuery.data.map((entry: any) => (
                      <li key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{new Date(entry.date).toLocaleDateString()}</p>
                            <p className="text-sm text-slate-600">Weight {entry.weightKg} kg</p>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <p>Next check</p>
                            <p className="font-medium text-slate-900">{entry.nextCheck ? new Date(entry.nextCheck).toLocaleDateString() : 'None'}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No monitoring entries available.</div>
                )}
              </div>
            </div>
          )}
          {tab === 'timeline' && <div>Timeline placeholder</div>}
        </div>
      </div>
    </div>
  );
}
