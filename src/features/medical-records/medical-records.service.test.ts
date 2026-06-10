import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('medicalRecordsService', () => {
  let supabaseMock: any;
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createMedicalRecord returns created record', async () => {
    const inserted = { data: { id: 'm1', pet_id: 'p1', doctor_id: 'd1', date: '2026-06-10', soap: {}, prescriptions: [], attachments: [] }, error: null };
    const loaded = { data: { id: 'm1', pet_id: 'p1', doctor_id: 'd1', date: '2026-06-10', soap: {}, prescriptions: [], attachments: [] }, error: null };

    const insertSingle = vi.fn().mockResolvedValue(inserted);
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));

    const loadSingle = vi.fn().mockResolvedValue(loaded);
    const eq = vi.fn(() => ({ single: loadSingle }));
    const loadSelect = vi.fn(() => ({ eq }));

    supabaseMock.from.mockReturnValueOnce({ insert }).mockReturnValueOnce({ select: loadSelect });

    const { medicalRecordsService } = await import('./medical-records.service');
    const res = await medicalRecordsService.createMedicalRecord({ petId: 'p1', doctorId: 'd1', date: '2026-06-10', soap: {} as any });
    expect(res.id).toBe('m1');
  });
});
