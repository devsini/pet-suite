import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('petsService', () => {
  let supabaseMock: any;
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createPet returns created pet', async () => {
    const returned = { data: { id: 'p1', name: 'Buddy', species: 'dog', breed: 'Labrador', age: 3, owner_id: 'c1', photo_url: null }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const { petsService } = await import('./pets.service');
    const res = await petsService.createPet({ name: 'Buddy', species: 'dog', ownerId: 'c1' });

    expect(insert).toHaveBeenCalled();
    expect(res.name).toBe('Buddy');
  });

  it('getPetById returns pet', async () => {
    const returned = { data: { id: 'p1', name: 'Buddy', species: 'dog', breed: 'Labrador', age: 3, owner_id: 'c1', photo_url: null }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ select });

    const { petsService } = await import('./pets.service');
    const res = await petsService.getPetById('p1');
    expect(res?.name).toBe('Buddy');
  });
});
