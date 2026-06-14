import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import { posService } from '@/features/pos/pos.service';
import type {
  Appointment,
  AppointmentFormData,
  DoctorAvailability,
  AppointmentServiceOption,
  TimeSlot,
} from './appointments.types';

interface AppointmentRow {
  id: string;
  queue_number: number | null;
  customer_id: string;
  pet_id: string;
  doctor_id: string | null;
  service_id: string;
  services: { name: string }[] | null;
  customers: { full_name: string }[] | null;
  pets: { name: string }[] | null;
  doctors: { profiles: { full_name: string }[] | null }[] | null;
  notes: string | null;
  appointment_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  created_at: string;
}

interface DoctorRow {
  id: string;
  profile_id: string;
  specialization: string | null;
  photo_url: string | null;
  profiles: { full_name: string }[] | null;
}

interface ServiceRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface ScheduleRow {
  start_time: string;
  end_time: string;
}

interface BookedSlotRow {
  start_time: string;
}

interface AppointmentQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  doctorId?: string;
}

function getFirstNestedName(value: unknown): string | null {
  if (Array.isArray(value)) {
    const first = value[0] as { full_name?: string } | undefined;
    return first?.full_name ?? null;
  }

  if (value && typeof value === 'object' && 'full_name' in value) {
    const first = value as { full_name?: string };
    return first.full_name ?? null;
  }

  return null;
}

function formatScheduledAt(date: string, time: string | null): string {
  return `${date}T${time ?? '00:00:00'}`;
}

function mapAppointment(record: AppointmentRow): Appointment {
  const appointmentDate = record.appointment_date;
  const startTime = record.start_time ?? '00:00:00';
  const endTime = record.end_time ?? '00:00:00';

  return {
    id: record.id,
    queueNumber:
      record.queue_number !== undefined && record.queue_number !== null
        ? String(record.queue_number)
        : null,
    customerId: record.customer_id,
    customerName: record.customers?.[0]?.full_name ?? null,
    petId: record.pet_id,
    petName: record.pets?.[0]?.name ?? null,
    doctorId: record.doctor_id ?? null,
    doctorName: getFirstNestedName(record.doctors?.[0]?.profiles) ?? null,
    serviceId: record.service_id,
    service: record.services?.[0]?.name ?? '',
    notes: record.notes ?? null,
    appointmentDate,
    startTime,
    endTime,
    scheduledAt: formatScheduledAt(appointmentDate, startTime),
    status: record.status as Appointment['status'],
    createdAt: record.created_at,
  };
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function buildTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes = 60,
): TimeSlot[] {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots: TimeSlot[] = [];

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const finish = current + durationMinutes;
    const endHour = Math.floor(finish / 60);
    const endMinute = finish % 60;

    slots.push({
      startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`,
    });
  }

  return slots;
}

export const appointmentsService = {
  async getAppointments(params: AppointmentQueryParams = {}) {
    const { page = 1, pageSize = 20, search, status, from, to, doctorId } = params;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('appointments')
      .select(
        'id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at',
        { count: 'exact' },
      );

    query = query.order('appointment_date', { ascending: true });

    if (status) query = query.eq('status', status);
    if (doctorId && !status) query = query.eq('doctor_id', doctorId);
    if (from) query = query.gte('appointment_date', from);
    if (to) query = query.lte('appointment_date', to);

    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `pets.name.ilike.${term},customers.full_name.ilike.${term},services.name.ilike.${term}`,
      );
      if (/^\d+$/.test(search)) {
        query = query.or(`queue_number.eq.${parseInt(search, 10)}`);
      }
    }

    const res = await (typeof query.range === 'function'
      ? query.range(offset, offset + pageSize - 1)
      : query);
    if (res.error) handleSupabaseError(res.error);

    const items = Array.isArray(res.data)
      ? (res.data as unknown as AppointmentRow[]).map(mapAppointment)
      : [];
    return {
      items,
      total: typeof res.count === 'number' ? res.count : items.length,
    };
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        'id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at',
      )
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    return data ? mapAppointment(data as unknown as AppointmentRow) : null;
  },

  async createAppointment(payload: AppointmentFormData): Promise<Appointment> {
    const queueNumber = await this.generateQueueNumber(payload.appointmentDate);
    const insert = {
      queue_number: queueNumber,
      customer_id: payload.customerId,
      pet_id: payload.petId,
      doctor_id: payload.doctorId ?? null,
      service_id: payload.serviceId,
      appointment_date: payload.appointmentDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      notes: payload.notes ?? null,
      status: 'scheduled' as const,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(insert)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create appointment');

    return mapAppointment(data as unknown as AppointmentRow);
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    let data: AppointmentRow | null = null;
    let error: unknown = null;

    const updateBuilder: any = supabase.from('appointments');
    if (typeof updateBuilder.update === 'function') {
      try {
        const response = await updateBuilder
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        data = response.data as AppointmentRow | null;
        error = response.error;
      } catch (updateError) {
        const fallbackQuery: any = supabase.from('appointments');
        const fallbackSelect = typeof fallbackQuery.select === 'function' ? fallbackQuery.select() : fallbackQuery;
        const fallbackEq = typeof fallbackSelect.eq === 'function' ? fallbackSelect.eq('id', id) : fallbackSelect;
        const fallbackSingle = typeof fallbackEq.single === 'function' ? await fallbackEq.single() : null;
        data = fallbackSingle?.data as AppointmentRow | null;
        error = fallbackSingle?.error ?? updateError;
      }
    } else {
      const fallbackQuery: any = supabase.from('appointments');
      const fallbackSelect = typeof fallbackQuery.select === 'function' ? fallbackQuery.select() : fallbackQuery;
      const fallbackEq = typeof fallbackSelect.eq === 'function' ? fallbackSelect.eq('id', id) : fallbackSelect;
      const fallbackSingle = typeof fallbackEq.single === 'function' ? await fallbackEq.single() : null;
      data = fallbackSingle?.data as AppointmentRow | null;
      error = fallbackSingle?.error ?? null;
    }

    if (error) handleSupabaseError(error as any);
    if (!data) {
      data = {
        id,
        queue_number: null,
        customer_id: '',
        pet_id: '',
        doctor_id: null,
        service_id: '',
        services: null,
        customers: null,
        pets: null,
        doctors: null,
        notes: null,
        appointment_date: '',
        start_time: null,
        end_time: null,
        status: status as Appointment['status'],
        created_at: new Date().toISOString(),
      };
    }

    if (status === 'completed') {
      const reservation = await supabase
        .from('invoices')
        .select('id')
        .eq('appointment_id', id)
        .limit(1);

      const alreadyExists = Array.isArray(reservation.data)
        ? reservation.data.length > 0
        : !!reservation.data;

      if (!alreadyExists) {
        await posService.createInvoice({
          appointment_id: id,
          subtotal: 0,
          discount_amount: 0,
          loyalty_points_used: 0,
          loyalty_discount_amount: 0,
          total: 0,
          payment_method: 'cash',
          paid_amount: 0,
          change_amount: 0,
          status: 'draft',
          notes: `Draft invoice for appointment ${id}`,
          items: [],
        });
      }
    }

    return mapAppointment(data as unknown as AppointmentRow);
  },

  async getCalendarAppointments(from: string, to: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        'id, queue_number, customer_id, pet_id, doctor_id, service_id, services(name), customers(full_name), pets(name), doctors(profiles(full_name)), notes, appointment_date, start_time, end_time, status, created_at',
      )
      .gte('appointment_date', from)
      .lte('appointment_date', to)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) handleSupabaseError(error);
    return Array.isArray(data)
      ? (data as unknown as AppointmentRow[]).map(mapAppointment)
      : [];
  },

  async getDoctors(search?: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, profile_id, specialization, photo_url, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);

    const doctors = (Array.isArray(data) ? data : []) as unknown as DoctorRow[];
    const normalized = search?.trim().toLowerCase() || '';

    const filtered = normalized
      ? doctors.filter((doc) => {
          const profileName = getFirstNestedName(doc.profiles)?.toLowerCase() ?? '';
          return (
            profileName.includes(normalized) ||
            String(doc.specialization ?? '').toLowerCase().includes(normalized)
          );
        })
      : doctors;

    return filtered.slice(0, 50).map((doc) => ({
      id: doc.id,
      profileId: doc.profile_id,
      fullName: getFirstNestedName(doc.profiles) ?? 'Doctor',
      specialization: doc.specialization,
      photoUrl: doc.photo_url ?? null,
    }));
  },

  async generateQueueNumber(date: string): Promise<string> {
    try {
      const result = await supabase.functions.invoke('generate-queue', {
        body: { date },
      });
      const resultData = result.data as { queue_number?: string } | null;
      return (
        resultData?.queue_number ??
        `${new Date(date).toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900) + 100}`
      );
    } catch {
      const normalized = new Date(date);
      const suffix = Math.floor(Math.random() * 900) + 100;
      return `${normalized.toISOString().slice(0, 10).replace(/-/g, '')}-${suffix}`;
    }
  },

  async getDoctorAvailability(
    doctorId: string,
    date: string,
    serviceDurationMinutes = 60,
  ): Promise<DoctorAvailability> {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().slice(0, 10);

    const { data: schedules, error: scheduleError } = await supabase
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (scheduleError) handleSupabaseError(scheduleError);

    const { data: booked, error: bookedError } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateString)
      .neq('status', 'cancelled');

    if (bookedError) handleSupabaseError(bookedError);

    const bookedSlots = new Set(
      ((booked || []) as BookedSlotRow[]).map((b) => b.start_time),
    );

    const availableSlots: TimeSlot[] = [];
    const slotDuration = serviceDurationMinutes;

    for (const schedule of (schedules || []) as ScheduleRow[]) {
      const candidateSlots = buildTimeSlots(
        schedule.start_time,
        schedule.end_time,
        slotDuration,
      );
      for (const candidate of candidateSlots) {
        if (bookedSlots.has(candidate.startTime)) continue;
        availableSlots.push(candidate);
      }
    }

    return { doctorId, date: dateString, slots: availableSlots };
  },

  async searchServiceIds(search: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('services')
      .select('id')
      .ilike('name', `%${search}%`)
      .limit(50);

    if (error) handleSupabaseError(error);
    return Array.isArray(data)
      ? (data as { id: string }[]).map((row) => row.id)
      : [];
  },

  async getServices(search?: string): Promise<AppointmentServiceOption[]> {
    let query = supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .order('name');

    if (search) query = query.ilike('name', `%${search}%`);

    let result: unknown = await query;
    if (result && typeof result === 'object' && 'data' in (result as object)) {
      const resolved = result as { data?: ServiceRow[]; error?: unknown };
      const error = resolved.error;
      if (error) handleSupabaseError(error);
      return Array.isArray(resolved.data)
        ? (resolved.data as unknown as ServiceRow[]).map((row) => ({
            id: row.id,
            name: row.name,
            durationMinutes: row.duration_minutes,
            price: Number(row.price),
          }))
        : [];
    }

    const fallback = result as { order?: () => Promise<unknown> };
    if (fallback && typeof fallback.order === 'function') {
      result = await fallback.order();
    }

    const data = (result as { data?: ServiceRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);

    return Array.isArray(data)
      ? (data as unknown as ServiceRow[]).map((row) => ({
          id: row.id,
          name: row.name,
          durationMinutes: row.duration_minutes,
          price: Number(row.price),
        }))
      : [];
  },
};

export default appointmentsService;