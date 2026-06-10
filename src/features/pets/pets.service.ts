import { supabase } from '@/lib/supabase';
import type { Pet, PetFormData } from './pets.types';

export const petsService = {
  async getPets({ page = 1, pageSize = 12, search, species }: any = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('pets').select('id, name, species, breed, age, owner_id, photo_url').order('created_at', { ascending: false });
    if (search) query = query.ilike('name', `%${search}%`);
    if (species) query = query.eq('species', species);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    return { items: res.data || [], total: res.count ?? (res.data || []).length };
  },

  async getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase.from('pets').select('id, name, species, breed, age, owner_id, photo_url').eq('id', id).single();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      ownerId: data.owner_id,
      photoUrl: data.photo_url
    };
  },

  async createPet(payload: PetFormData): Promise<Pet> {
    const insert = { name: payload.name, species: payload.species, breed: payload.breed ?? null, age: payload.age ?? null, owner_id: payload.ownerId };
    const { data, error } = await supabase.from('pets').insert(insert).select().single();
    if (error) throw new Error(error.message);
    return { id: data.id, name: data.name, species: data.species, breed: data.breed, age: data.age, ownerId: data.owner_id, photoUrl: data.photo_url };
  },

  async updatePet(id: string, updates: Partial<PetFormData>) {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.species) payload.species = updates.species;
    if (updates.breed !== undefined) payload.breed = updates.breed;
    if (updates.age !== undefined) payload.age = updates.age;
    const { data, error } = await supabase.from('pets').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async generateQRCode(id: string) {
    // simple placeholder returning data URL
    return `https://api.qrserver.com/v1/create-qr-code/?data=pet:${id}&size=200x200`;
  },

  async getPetTimeline(id: string) {
    const { data, error } = await supabase.from('pet_timeline').select('*').eq('pet_id', id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
};

export default petsService;
