import { BedDouble, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Cage, InpatientRecord } from '../inpatient.types';

interface CageGridProps {
  cages: Cage[];
  inpatientRecords: InpatientRecord[];
  onCageClick: (cage: Cage, inpatient?: InpatientRecord) => void;
}

const statusStyles: Record<string, string> = {
  available: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30',
  occupied: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30',
  maintenance: 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800 opacity-60'
};

export function CageGrid({ cages, inpatientRecords, onCageClick }: CageGridProps) {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))]">
      {cages.map((cage) => {
        const record = inpatientRecords.find((item) => item.cageId === cage.id);
        const statusClass = statusStyles[cage.status] ?? statusStyles.maintenance;
        const isClickable = cage.status !== 'maintenance';

        const card = (
          <div
            className={cn(
              'rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              statusClass,
              isClickable ? 'cursor-pointer' : 'opacity-80'
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{cage.name}</p>
                <Badge variant={cage.status === 'available' ? 'emerald' : cage.status === 'occupied' ? 'amber' : 'slate'} className="mt-2">
                  {cage.status.replace('-', ' ')}
                </Badge>
              </div>
              {cage.status === 'available' ? (
                <div className="rounded-2xl bg-white/80 p-2 text-emerald-600">
                  <BedDouble className="h-6 w-6" />
                </div>
              ) : cage.status === 'maintenance' ? (
                <div className="rounded-2xl bg-white/80 p-2 text-slate-600">
                  <Wrench className="h-6 w-6" />
                </div>
              ) : null}
            </div>

            {record ? (
              <div className="space-y-3 text-sm text-slate-700">
                <div className="font-medium text-slate-900">{record.petName ?? record.petId}</div>
                <div>Doctor: {record.doctorName ?? record.admittingDoctorId}</div>
                <div>Admitted: {Math.max(1, Math.floor((Date.now() - new Date(record.admitDate).getTime()) / 86400000))} days</div>
              </div>
            ) : cage.status === 'available' ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Available</p>
                <p>Ready for admission</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Maintenance</p>
                <p>Unavailable until cleaned</p>
              </div>
            )}
          </div>
        );

        return isClickable ? (
          <button
            key={cage.id}
            type="button"
            onClick={() => onCageClick(cage, record)}
            className="text-left"
          >
            {card}
          </button>
        ) : (
          <div key={cage.id}>{card}</div>
        );
      })}
    </div>
  );
}
