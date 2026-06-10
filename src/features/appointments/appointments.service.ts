import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentFormData, DoctorAvailability } from './appointments.types';

export const appointmentsService = {
  async getAppointments({ page = 1, pageSize = 20, search, status, from, to, doctorId }: any = {}) {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('appointments').select('id, queue_number, customer_id, pet_id, doctor_id, service, notes, scheduled_at, status, created_at', { count: 'exact' }).order('scheduled_at', { ascending: true });

    if (search) query = query.ilike('service', `%${search}%`);
    if (status) query = query.eq('status', status);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (from) query = query.gte('scheduled_at', from);
    if (to) query = query.lte('scheduled_at', to);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    return { items: res.data || [], total: res.count ?? (res.data || []).length };
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data || null;
  },

  async createAppointment(payload: AppointmentFormData): Promise<Appointment> {
    const insert = {
      customer_id: payload.customerId,
      pet_id: payload.petId,
      doctor_id: payload.doctorId ?? null,
      service: payload.service,
      notes: payload.notes ?? null,
      scheduled_at: payload.scheduledAt,
      status: 'scheduled'
    };
    const { data, error } = await supabase.from('appointments').insert(insert).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getCalendarAppointments(from: string, to: string) {
    const { data, error } = await supabase.from('appointments').select('*').gte('scheduled_at', from).lte('scheduled_at', to).order('scheduled_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async generateQueueNumber(date: string) {
    // simple queue generator using timestamp and random suffix
    const suffix = Math.floor(Math.random() * 900) + 100;
    return `${new Date(date).toISOString().slice(0,10).replace(/-/g,'')}-${suffix}`;
  },

  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    // placeholder: returns hourly slots 09:00-16:00 excluding existing appointments
    const slots = Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(date);
      d.setHours(9 + i, 0, 0, 0);
      return d.toISOString();
    });

    const { data: booked } = await supabase.from('appointments').select('scheduled_at').eq('doctor_id', doctorId).gte('scheduled_at', date).lt('scheduled_at', new Date(new Date(date).getTime() + 24*60*60*1000).toISOString());
    const bookedSet = new Set((booked || []).map((b: any) => b.scheduled_at));
    return { doctorId, date, slots: slots.filter((s) => !bookedSet.has(s)) };
  }
};

export default appointmentsService;
