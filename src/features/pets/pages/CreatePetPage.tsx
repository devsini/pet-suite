import React, { useState } from 'react';
import { useCreatePet } from '../pets.hooks';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreatePetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const ownerQuery = new URLSearchParams(location.search).get('owner') || '';

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog'|'cat'|'bird'|'other'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);

  const mutation = useCreatePet();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ name, species, breed, age, ownerId: ownerQuery });
      alert('Pet created');
      navigate('/staff/pets');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Pet</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Species</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value as any)} className="w-full p-2 border rounded">
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Breed</label>
          <input value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input type="number" value={age ?? ''} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <button type="submit" className="px-3 py-1 border rounded">Create</button>
        </div>
      </form>
    </div>
  );
}
