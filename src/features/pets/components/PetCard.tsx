import React from 'react';
import { PawPrint } from 'lucide-react';
import type { Pet } from '../pets.types';

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="p-3 border rounded flex items-center gap-3">
      {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center"><PawPrint /></div>}
      <div>
        <div className="font-semibold">{pet.name}</div>
        <div className="text-sm text-gray-500">{pet.species} • {pet.breed}</div>
      </div>
    </div>
  );
}
