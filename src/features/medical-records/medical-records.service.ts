import { supabase } from '@/lib/supabase';
import type {
  MedicalRecord,
  MedicalRecordCreatePayload,
  MedicalRecordsQueryParams,
  Prescription,
  MedicalAttachment
} from './medical-records.types';

function mapPrescription(record: any): Prescription {
  return {
    id: record.id,
    medication: record.medication,
    dosage: record.dosage,
    frequency: record.frequency,
    duration: record.duration
  };
}

function mapAttachment(record: any): MedicalAttachment {
  return {
    id: record.id,
    filename: record.filename,
    url: record.url,
    uploadedAt: record.uploaded_at || record.uploadedAt
  };
}

function mapMedicalRecord(record: any): MedicalRecord {
  return {
    id: record.id,
    appointmentId: record.appointment_id || record.appointmentId || null,
    petId: record.pet_id || record.petId,
    doctorId: record.doctor_id || record.doctorId,
    date: record.date,
    soap: record.soap,
    prescriptions: Array.isArray(record.prescriptions)
      ? record.prescriptions.map(mapPrescription)
      : [],
    attachments: Array.isArray(record.attachments)
      ? record.attachments.map(mapAttachment)
      : []
  };
}

function mapSummaryRecord(record: any): MedicalRecord {
  return {
    id: record.id,
    appointmentId: record.appointment_id || record.appointmentId || null,
    petId: record.pet_id || record.petId,
    doctorId: record.doctor_id || record.doctorId,
    date: record.date,
    soap: record.soap || { subjective: '', objective: '', assessment: '', plan: '' },
    prescriptions: [],
    attachments: []
  };
}

export const medicalRecordsService = {
  async getMedicalRecords({ page = 1, pageSize = 20, search, petId, doctorId }: MedicalRecordsQueryParams = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('medical_records')
      .select('id, pet_id, doctor_id, date', { count: 'exact' })
      .order('date', { ascending: false });

    if (petId) query = query.eq('pet_id', petId);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (search) {
      const term = `%${search}%`;
      query = query.or(`pet_id.ilike.${term},doctor_id.ilike.${term}`);
    }

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);

    return {
      items: Array.isArray(res.data) ? res.data.map(mapSummaryRecord) : [],
      total: typeof res.count === 'number' ? res.count : (res.data || []).length
    };
  },

  async getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*, prescriptions(*), attachments(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? mapMedicalRecord(data) : null;
  },

  async createMedicalRecord(payload: MedicalRecordCreatePayload): Promise<MedicalRecord> {
    const { prescriptions = [], attachments = [], ...recordPayload } = payload;
    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        pet_id: recordPayload.petId,
        doctor_id: recordPayload.doctorId,
        date: recordPayload.date,
        soap: recordPayload.soap
      })
      .select()
      .single();

    if (error || !record) throw new Error(error?.message || 'Unable to create medical record');

    if (prescriptions.length) {
      await this.insertPrescriptions(record.id, prescriptions);
    }

    if (attachments.length) {
      await this.insertAttachments(record.id, attachments);
    }

    const created = await this.getMedicalRecordById(record.id);
    if (!created) throw new Error('Unable to retrieve new medical record');
    return created;
  },

  async updateMedicalRecord(id: string, updates: any) {
    const transformed = {
      ...(updates.petId !== undefined ? { pet_id: updates.petId } : {}),
      ...(updates.doctorId !== undefined ? { doctor_id: updates.doctorId } : {}),
      ...(updates.date !== undefined ? { date: updates.date } : {}),
      ...(updates.soap !== undefined ? { soap: updates.soap } : {})
    };

    const { data, error } = await supabase.from('medical_records').update(transformed).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async addPrescription(recordId: string, prescription: Omit<Prescription, 'id'>) {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({ medical_record_id: recordId, ...prescription })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapPrescription(data);
  },

  async removePrescription(id: string) {
    const { error } = await supabase.from('prescriptions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  async uploadAttachment(recordId: string, file: { name: string; url: string }) {
    const { data, error } = await supabase
      .from('attachments')
      .insert({ medical_record_id: recordId, filename: file.name, url: file.url })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapAttachment(data);
  },

  async removeAttachment(id: string) {
    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  async insertPrescriptions(recordId: string, prescriptions: Array<Omit<Prescription, 'id'>>) {
    const rows = prescriptions.map((prescription) => ({ medical_record_id: recordId, ...prescription }));
    const { error } = await supabase.from('prescriptions').insert(rows);
    if (error) throw new Error(error.message);
    return true;
  },

  async insertAttachments(recordId: string, attachments: Array<Omit<MedicalAttachment, 'id' | 'uploadedAt'>>) {
    const rows = attachments.map((attachment) => ({ medical_record_id: recordId, filename: attachment.filename, url: attachment.url }));
    const { error } = await supabase.from('attachments').insert(rows);
    if (error) throw new Error(error.message);
    return true;
  }
};

export default medicalRecordsService;
