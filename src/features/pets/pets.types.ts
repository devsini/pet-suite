export type Species = 'dog' | 'cat' | 'bird' | 'other';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string | null;
  age?: number | null;
  ownerId: string;
  photoUrl?: string | null;
  status?: string;
}

export interface PetFormData {
  name: string;
  species: Species;
  breed?: string;
  age?: number;
  ownerId: string;
}

export interface WeightRecord { id: string; petId: string; weight: number; recordedAt: string }
