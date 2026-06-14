import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';

export interface OwnerStats {
  revenueToday: number;
  appointmentsToday: number;
  activeInpatients: number;
  pendingVaccinations: number;
  lowStockCount: number;
}

export interface WeeklyRevenuePoint {
  date: string;
  amount: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface RecentTransaction {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customerName: string | null;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface DoctorAppointment {
  id: string;
  appointmentDate: string;
  startTime: string | null;
  service: string | null;
  petName: string | null;
  customerName: string | null;
  status: string;
}

export interface MedicalRecordSummary {
  id: string;
  petName: string | null;
  createdAt: string;
  recordType: string;
}

export interface DoctorStats {
  todayAppointments: DoctorAppointment[];
  recentMedicalRecords: MedicalRecordSummary[];
  activeInpatients: number;
}

export interface StaffAppointmentSummary {
  id: string;
  appointmentDate: string;
  startTime: string | null;
  service: string | null;
  petName: string | null;
  status: string;
}

export interface StaffStats {
  todayAppointments: StaffAppointmentSummary[];
  lowStockAlerts: LowStockItem[];
  todayGrooming: {
    id: string;
    petName: string | null;
    service: string | null;
    scheduledAt: string;
    status: string;
  }[];
}

interface InventoryRow {
  id: string;
  name: string;
  current_stock: number;
  min_stock: number;
}

interface InvoiceRow {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  created_at: string;
  customer_id: string;
  customers: { full_name: string }[] | null;
}

interface AppointmentRow {
  id: string;
  appointment_date: string;
  start_time: string | null;
  status: string;
  services: { name: string }[] | null;
  pets: { name: string }[] | null;
  customers: { full_name: string }[] | null;
}

interface MedicalRecordRow {
  id: string;
  created_at: string;
  record_type: string;
  pets: { name: string }[] | null;
}

interface GroomingRow {
  id: string;
  scheduled_at: string;
  status: string;
  pets: { name: string }[] | null;
  services: { name: string }[] | null;
}

function isLowStock(item: InventoryRow): boolean {
  return item.current_stock <= item.min_stock;
}

function getMonthEndDate(month: number, year: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export const dashboardService = {
  async getOwnerStats(): Promise<OwnerStats> {
    const today = new Date().toISOString().slice(0, 10);
    const [
      appointmentsResult,
      inpatientResult,
      vaccinationsResult,
      lowStockResult,
      revenueResult,
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('appointment_date', today),
      supabase
        .from('inpatient_records')
        .select('id', { count: 'exact' })
        .eq('status', 'admitted'),
      supabase
        .from('vaccination_reminders')
        .select('id', { count: 'exact' })
        .lte('remind_at', new Date().toISOString())
        .eq('status', 'pending'),
      supabase
        .from('inventory_items')
        .select('id, current_stock, min_stock'),
      supabase
        .from('invoices')
        .select('total')
        .eq('status', 'paid')
        .eq('paid_at', today),
    ]);

    [appointmentsResult, inpatientResult, vaccinationsResult, lowStockResult, revenueResult].forEach(
      (result) => {
        if (result.error) handleSupabaseError(result.error);
      },
    );

    const lowStockData = (lowStockResult.data as unknown as InventoryRow[] | null) || [];
    const lowStockCount = Array.isArray(lowStockData)
      ? lowStockData.filter(isLowStock).length
      : Number(lowStockResult.count ?? 0);
    const fallbackLowStockCount = Number(lowStockResult.count ?? 0);
    return {
      revenueToday: (revenueResult.data || []).reduce(
        (sum: number, invoice: { total?: number }) => sum + Number(invoice.total ?? 0),
        0,
      ),
      appointmentsToday: appointmentsResult.count ?? 0,
      activeInpatients: inpatientResult.count ?? 0,
      pendingVaccinations: vaccinationsResult.count ?? 0,
      lowStockCount: lowStockCount || fallbackLowStockCount,
    };

  },

  async getWeeklyRevenue(): Promise<WeeklyRevenuePoint[]> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const startIso = start.toISOString();

    const { data, error } = await supabase
      .from('invoices')
      .select('paid_at, total')
      .gte('paid_at', startIso)
      .eq('status', 'paid');

    if (error) handleSupabaseError(error);

    const points: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      points[date.toISOString().slice(0, 10)] = 0;
    }

    (data || []).forEach((row: { paid_at: string; total?: number }) => {
      const dateKey = new Date(row.paid_at).toISOString().slice(0, 10);
      points[dateKey] = (points[dateKey] ?? 0) + Number(row.total ?? 0);
    });

    return Object.entries(points).map(([date, amount]) => ({ date, amount }));
  },

  async getAppointmentStatusBreakdown(month: number, year: number): Promise<StatusBreakdown[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = getMonthEndDate(month, year);

    const { data, error } = await supabase
      .from('appointments')
      .select('status, id', { count: 'exact' })
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('status');

    if (error) handleSupabaseError(error);

    const counts: Record<string, number> = {};
    (data || []).forEach((row: { status: string }) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  },

  async getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, status, created_at, customer_id, customers(full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error);

    return ((data || []) as unknown as InvoiceRow[]).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      total: Number(invoice.total ?? 0),
      status: invoice.status,
      createdAt: invoice.created_at,
      customerName: invoice.customers?.[0]?.full_name ?? null,
    }));
  },

  async getLowStockItems(limit = 5): Promise<LowStockItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, current_stock, min_stock')
      .order('current_stock', { ascending: true });

    if (error) handleSupabaseError(error);

    return ((data || []) as unknown as InventoryRow[])
      .filter(isLowStock)
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        name: row.name,
        currentStock: Number(row.current_stock ?? 0),
        minStock: Number(row.min_stock ?? 0),
      }));
  },

  async getDoctorStats(doctorProfileId: string): Promise<DoctorStats> {
    if (!doctorProfileId) {
      return {
        todayAppointments: [],
        recentMedicalRecords: [],
        activeInpatients: 0,
      };
    }

    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('profile_id', doctorProfileId)
      .maybeSingle();

    if (doctorError) handleSupabaseError(doctorError);

    const doctorId = (doctorData as { id: string } | null)?.id;
    if (!doctorId) {
      return {
        todayAppointments: [],
        recentMedicalRecords: [],
        activeInpatients: 0,
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const [appointmentsResult, medicalRecordsResult, inpatientResult] = await Promise.all([
      supabase
        .from('appointments')
        .select(
          'id, appointment_date, start_time, services(name), pets(name), customers(full_name), status',
        )
        .eq('doctor_id', doctorId)
        .eq('appointment_date', today),
      supabase
        .from('medical_records')
        .select('id, created_at, record_type, pets(name)')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('inpatient_records')
        .select('id', { count: 'exact' })
        .eq('admitting_doctor_id', doctorId)
        .eq('status', 'admitted'),
    ]);

    [appointmentsResult, medicalRecordsResult, inpatientResult].forEach((result) => {
      if (result.error) handleSupabaseError(result.error);
    });

    return {
      todayAppointments: ((appointmentsResult.data || []) as unknown as AppointmentRow[]).map(
        (row) => ({
          id: row.id,
          appointmentDate: row.appointment_date,
          startTime: row.start_time,
          service: Array.isArray(row.services) ? row.services[0]?.name ?? null : (row.services as any)?.name ?? null,
          petName: Array.isArray(row.pets) ? row.pets[0]?.name ?? null : (row.pets as any)?.name ?? null,
          customerName: Array.isArray(row.customers) ? row.customers[0]?.full_name ?? null : (row.customers as any)?.full_name ?? null,
          status: row.status,
        }),
      ),
      recentMedicalRecords: (
        (medicalRecordsResult.data || []) as unknown as MedicalRecordRow[]
      ).map((row) => ({
        id: row.id,
        petName: Array.isArray(row.pets) ? row.pets[0]?.name ?? null : (row.pets as any)?.name ?? null,
        createdAt: row.created_at,
        recordType: row.record_type ?? 'Record',
      })),
      activeInpatients: inpatientResult.count ?? 0,
    };
  },

  async getStaffStats(): Promise<StaffStats> {
    const today = new Date().toISOString().slice(0, 10);
    const [appointmentsResult, lowStockResult, groomingResult] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, appointment_date, start_time, services(name), pets(name), status')
        .eq('appointment_date', today),
      supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock')
        .order('current_stock', { ascending: true }),
      supabase
        .from('grooming_records')
        .select('id, scheduled_at, pets(name), services(name), status')
        .gte('scheduled_at', `${today}T00:00:00Z`)
        .lte('scheduled_at', `${today}T23:59:59Z`),
    ]);

    [appointmentsResult, lowStockResult, groomingResult].forEach((result) => {
      if (result.error) handleSupabaseError(result.error);
    });

    return {
      todayAppointments: ((appointmentsResult.data || []) as unknown as AppointmentRow[]).map(
        (row) => ({
          id: row.id,
          appointmentDate: row.appointment_date,
          startTime: row.start_time,
          service: row.services?.[0]?.name ?? null,
          petName: row.pets?.[0]?.name ?? null,
          status: row.status,
        }),
      ),
      lowStockAlerts: ((lowStockResult.data || []) as unknown as InventoryRow[])
        .filter(isLowStock)
        .slice(0, 5)
        .map((row) => ({
          id: row.id,
          name: row.name,
          currentStock: Number(row.current_stock ?? 0),
          minStock: Number(row.min_stock ?? 0),
        })),
      todayGrooming: ((groomingResult.data || []) as unknown as GroomingRow[]).map((row) => ({
        id: row.id,
        scheduledAt: row.scheduled_at,
        petName: row.pets?.[0]?.name ?? null,
        service: row.services?.[0]?.name ?? null,
        status: row.status,
      })),
    };
  },
};