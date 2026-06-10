import React, { useState } from 'react';
import { useGetPets } from '../pets.hooks';
import { Search } from 'lucide-react';

export default function PetsPage() {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState<'all'|'dog'|'cat'|'bird'|'other'>('all');
  const { data, isLoading } = useGetPets({ page: 1, pageSize: 12, search, species: species==='all'?undefined:species });

  const items = data?.items ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Pets</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center border rounded px-2">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pet name" className="p-2 outline-none" />
        </div>
        <select value={species} onChange={(e) => setSpecies(e.target.value as any)} className="p-2 border rounded">
          <option value="all">All species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? <div>Loading...</div> : items.map((p: any) => (
          <div key={p.id} className="p-4 border rounded">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-500">{p.species} • {p.breed}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
