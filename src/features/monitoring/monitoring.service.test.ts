import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('monitoringService', () => {
  let supabaseMock: any;
  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('createMonitoringEntry inserts entry, uploads and returns created entry with uploads', async () => {
    const insertResult = { data: { id: 'm1', pet_id: 'p1', date: '2026-01-01', weight_kg: 5, medication_plan: 'plan', recovery_notes: 'ok', next_check: null }, error: null };
    const getResult = {
      data: {
        id: 'm1',
        pet_id: 'p1',
        date: '2026-01-01',
        weight_kg: 5,
        medication_plan: 'plan',
        recovery_notes: 'ok',
        next_check: null,
        uploads: [
          { id: 'u1', entry_id: 'm1', pet_id: 'p1', filename: 'img.jpg', url: '/uploads/img.jpg', status: 'pending', uploaded_at: '2026-01-02T00:00:00Z' }
        ]
      },
      error: null
    };

    // monitoring_entries.insert(...).select().single()
    const singleInsert = vi.fn().mockResolvedValue(insertResult);
    const selectForInsert = vi.fn(() => ({ single: singleInsert }));
    const insertFn = vi.fn(() => ({ select: selectForInsert }));

    // monitoring_uploads.insert(...)
    const insertUploadsFn = vi.fn().mockResolvedValue({ error: null });

    // monitoring_entries.select('*, uploads(*)').eq().single()
    const singleGet = vi.fn().mockResolvedValue(getResult);
    const eqForGet = vi.fn(() => ({ single: singleGet }));
    const selectForGet = vi.fn(() => ({ eq: eqForGet }));

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'monitoring_entries') {
        return { insert: insertFn, select: selectForGet };
      }
      if (table === 'monitoring_uploads') {
        return { insert: insertUploadsFn };
      }
      return {};
    });

    const { monitoringService } = await import('./monitoring.service');

    const payload = {
      petId: 'p1',
      date: '2026-01-01',
      weightKg: 5,
      medicationPlan: 'plan',
      recoveryNotes: 'ok',
      nextCheck: null,
      uploads: [{ petId: 'p1', filename: 'img.jpg', url: '/uploads/img.jpg' }]
    };

    const res = await monitoringService.createMonitoringEntry(payload as any);

    expect(insertFn).toHaveBeenCalled();
    expect(insertUploadsFn).toHaveBeenCalled();
    expect(res.id).toBe('m1');
    expect(res.uploads).toHaveLength(1);
    expect(res.uploads[0].filename).toBe('img.jpg');
  });

  it('uploadOwnerMedia inserts upload and returns mapping', async () => {
    const returned = { data: { id: 'u2', entry_id: 'm2', pet_id: 'p2', filename: 'photo.png', url: '/uploads/photo.png', status: 'pending', uploaded_at: '2026-01-03T00:00:00Z' }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const { monitoringService } = await import('./monitoring.service');
    const res = await monitoringService.uploadOwnerMedia('m2', { petId: 'p2', filename: 'photo.png', url: '/uploads/photo.png' });

    expect(insert).toHaveBeenCalled();
    expect(res.id).toBe('u2');
    expect(res.filename).toBe('photo.png');
  });

  it('approveUpload updates status and returns upload mapping', async () => {
    const returned = { data: { id: 'u3', entry_id: 'm3', pet_id: 'p3', filename: 'x.pdf', url: '/uploads/x.pdf', status: 'approved', uploaded_at: '2026-01-04T00:00:00Z' }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ update });

    const { monitoringService } = await import('./monitoring.service');
    const res = await monitoringService.approveUpload('u3', 'approved');

    expect(update).toHaveBeenCalled();
    expect(res.status).toBe('approved');
    expect(res.id).toBe('u3');
  });
});
