import { supabase } from '@/lib/supabase';
import type { MonitoringEntry, MonitoringCreatePayload, MonitoringQueryParams, MonitoringUpload } from './monitoring.types';

function mapUpload(record: any): MonitoringUpload {
  return {
    id: record.id,
    entryId: record.entry_id,
    petId: record.pet_id,
    filename: record.filename,
    url: record.url,
    status: record.status,
    uploadedAt: record.uploaded_at || record.uploadedAt
  };
}

function mapEntry(record: any, uploads: any[] = []): MonitoringEntry {
  return {
    id: record.id,
    petId: record.pet_id,
    date: record.date,
    weightKg: record.weight_kg,
    medicationPlan: record.medication_plan,
    recoveryNotes: record.recovery_notes,
    nextCheck: record.next_check,
    uploads: Array.isArray(uploads) ? uploads.map(mapUpload) : []
  };
}

export const monitoringService = {
  async getMonitoringEntries({ page = 1, pageSize = 12, search, petId }: MonitoringQueryParams = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('monitoring_entries')
      .select('id, pet_id, date, weight_kg, medication_plan, recovery_notes, next_check', { count: 'exact' })
      .order('date', { ascending: false });

    if (petId) query = query.eq('pet_id', petId);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pet_id.ilike.${term},medication_plan.ilike.${term},recovery_notes.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    return {
      items: Array.isArray(res.data)
        ? res.data.map((record: any) => mapEntry(record))
        : [],
      total: typeof res.count === 'number' ? res.count : (res.data || []).length
    };
  },

  async getMonitoringByPet(petId: string) {
    const { data, error } = await supabase
      .from('monitoring_entries')
      .select('id, pet_id, date, weight_kg, medication_plan, recovery_notes, next_check')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data.map((record: any) => mapEntry(record)) : [];
  },

  async getMonitoringEntryById(id: string) {
    const { data, error } = await supabase
      .from('monitoring_entries')
      .select('*, uploads(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? mapEntry(data, data.uploads) : null;
  },

  async createMonitoringEntry(payload: MonitoringCreatePayload) {
    const { uploads = [], ...entry } = payload;
    const { data, error } = await supabase
      .from('monitoring_entries')
      .insert({
        pet_id: entry.petId,
        date: entry.date,
        weight_kg: entry.weightKg,
        medication_plan: entry.medicationPlan,
        recovery_notes: entry.recoveryNotes,
        next_check: entry.nextCheck
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to create monitoring entry');

    if (uploads.length) {
      await this.insertUploads(data.id, uploads);
    }

    const created = await this.getMonitoringEntryById(data.id);
    if (!created) throw new Error('Unable to retrieve monitoring entry');
    return created;
  },

  async insertUploads(entryId: string, uploads: Array<Pick<MonitoringUpload, 'filename' | 'url' | 'petId'>>) {
    const rows = uploads.map((upload) => ({ entry_id: entryId, pet_id: upload.petId, filename: upload.filename, url: upload.url, status: 'pending' }));
    const { error } = await supabase.from('monitoring_uploads').insert(rows);
    if (error) throw new Error(error.message);
    return true;
  },

  async uploadOwnerMedia(entryId: string, upload: Pick<MonitoringUpload, 'filename' | 'url' | 'petId'>) {
    const { data, error } = await supabase
      .from('monitoring_uploads')
      .insert({ entry_id: entryId, pet_id: upload.petId, filename: upload.filename, url: upload.url, status: 'pending' })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to upload media');
    return mapUpload(data);
  },

  async approveUpload(id: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('monitoring_uploads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Unable to update upload status');
    return mapUpload(data);
  }
};

export default monitoringService;
