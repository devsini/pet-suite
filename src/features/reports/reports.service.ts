import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { FinancialReport, MonthlyPoint } from './reports.types';

function applyQueryBuilder(builder: any, steps: Array<[string, ...unknown[]]>) {
  let current = builder;
  for (const [method, ...args] of steps) {
    if (current && typeof current[method] === 'function') {
      current = current[method](...args);
    }
  }
  return current;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const reportsService = {
  async getFinancialReport({ startDate, endDate }: { startDate?: string; endDate?: string } = {}): Promise<FinancialReport> {
    const from = startDate || new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString();
    const to = endDate || new Date().toISOString();

    // gather invoices in range
    const invoicesQuery: any = supabase.from('invoices').select('id, total, created_at');
    const invoicesBuilder = applyQueryBuilder(invoicesQuery, [['gte', 'created_at', from], ['lte', 'created_at', to]]);
    const { data: invoices = [], error: invErr } = await invoicesBuilder;
    if (invErr) handleSupabaseError(invErr);

    // gather transactions (expenses) in range
    const transactionsQuery: any = supabase.from('transactions').select('id, amount, type, created_at');
    const transactionsBuilder = applyQueryBuilder(transactionsQuery, [['gte', 'created_at', from], ['lte', 'created_at', to]]);
    const { data: txs = [], error: txErr } = await transactionsBuilder;
    if (txErr) handleSupabaseError(txErr);

    const totalRevenue = (invoices || []).reduce((s: number, inv: any) => s + Number(inv.total || 0), 0);
    const totalExpense = (txs || []).reduce((s: number, t: any) => s + (t.type === 'debit' ? Number(t.amount || 0) : 0), 0);

    // monthly trend — revenue per month
    const monthMap: Record<string, number> = {};
    (invoices || []).forEach((inv: any) => {
      const k = monthKey(inv.created_at || inv.createdAt || new Date().toISOString());
      monthMap[k] = (monthMap[k] || 0) + Number(inv.total || 0);
    });

    // produce last 12 months
    const points: MonthlyPoint[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      points.push({ month: k, value: monthMap[k] || 0 });
    }

    return {
      summary: {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense
      },
      monthlyTrend: points
    };
  },

  async getClinicalStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();

    const recordsQuery: any = supabase.from('medical_records').select('pet_id, assessment, record_type, created_at');
    const recordsBuilder = applyQueryBuilder(recordsQuery, [['gte', 'created_at', f], ['lte', 'created_at', t]]);
    const { data: records = [], error: recErr } = await recordsBuilder;
    if (recErr) handleSupabaseError(recErr);

    const totalPatients = new Set((records || []).map((r: any) => r.pet_id)).size;

    const apptsQuery: any = supabase.from('appointments').select('customer_id, status, created_at');
    const apptsBuilder = applyQueryBuilder(apptsQuery, [['gte', 'created_at', f], ['lte', 'created_at', t]]);
    const { data: appts = [], error: apptErr } = await apptsBuilder;
    if (apptErr) handleSupabaseError(apptErr);
    const newPatients = new Set((appts || []).map((a: any) => a.customer_id)).size;
    const appointmentCount = (appts || []).length;
    const completedAppointments = (appts || []).filter((a: any) => a.status === 'completed').length;

    const diagCount: Record<string, number> = {};
    (records || []).forEach((r: any) => { const key = (r.assessment || 'Unknown').trim(); if (!key) return; diagCount[key] = (diagCount[key] || 0) + 1; });
    const topDiagnoses = Object.entries(diagCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

    const typeBreakdown: Record<string, number> = {};
    (records || []).forEach((r: any) => { typeBreakdown[r.record_type] = (typeBreakdown[r.record_type] || 0) + 1; });

    return { totalPatients, newPatients, appointmentCount, completedAppointments, topDiagnoses, typeBreakdown };
  },

  async getDoctorStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const appointmentsQuery: any = supabase.from('appointments').select('id, doctor_id, pet_id, service_id, created_at');
    const appointmentsBuilder = applyQueryBuilder(appointmentsQuery, [['gte', 'created_at', f], ['lte', 'created_at', t]]);
    const { data: appts = [], error: err } = await appointmentsBuilder;
    if (err) handleSupabaseError(err);

    const byDoctor: Record<string, { patients: Set<string>; services: number; appointments: number; revenue: number }> = {};
    for (const a of (appts || [])) {
      const d = a.doctor_id || 'unassigned';
      if (!byDoctor[d]) byDoctor[d] = { patients: new Set(), services: 0, appointments: 0, revenue: 0 };
      byDoctor[d].patients.add(a.pet_id);
      byDoctor[d].services += 1;
      byDoctor[d].appointments += 1;
    }

    // revenue from invoices linked via appointment
    const appointmentIds = (appts || []).map((a: any) => a.id);
    const invoicesQuery: any = supabase.from('invoices').select('id, appointment_id, total');
    const invoicesBuilder = applyQueryBuilder(invoicesQuery, [['in', 'appointment_id', appointmentIds]]);
    const { data: invoices = [] } = await invoicesBuilder;
    const invMap: Record<string, number> = {};
    (invoices || []).forEach((inv: any) => { if (!inv || !inv.appointment_id) return; invMap[inv.appointment_id] = Number(inv.total || 0); });

    for (const a of (appts || [])) {
      const d = a.doctor_id || 'unassigned';
      byDoctor[d].revenue += invMap[a.id] || 0;
    }

    const results = [];
    for (const [doctorId, stats] of Object.entries(byDoctor)) {
      // fetch doctor name
      const doctorQuery: any = supabase.from('doctors').select('id, profile_id');
      const doctorBuilder = applyQueryBuilder(doctorQuery, [['eq', 'id', doctorId]]);
      const doctorResponse = typeof doctorBuilder?.maybeSingle === 'function' ? await doctorBuilder.maybeSingle() : { data: null };
      const { data: doc } = doctorResponse as { data?: { profile_id?: string } | null };
      let name = 'Unknown';
      if (doc?.profile_id) {
        const profileQuery: any = supabase.from('profiles').select('full_name');
        const profileBuilder = applyQueryBuilder(profileQuery, [['eq', 'id', doc.profile_id]]);
        const profileResponse = typeof profileBuilder?.maybeSingle === 'function' ? await profileBuilder.maybeSingle() : { data: null };
        const { data: prof } = profileResponse as { data?: { full_name?: string } | null };
        if (prof) name = prof.full_name || 'Unknown';
      }
      results.push({ doctorId, doctorName: name, patients: stats.patients.size, services: stats.services, revenue: stats.revenue });
    }

    return results;
  },

  async getInventoryStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const threshold30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threshold90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: items = [], error: itemErr } = await supabase
      .from('inventory_items')
      .select('id, name, category_id, current_stock, min_stock, price_per_unit, inventory_categories(name as category_name)');
    if (itemErr) handleSupabaseError(itemErr);

    const lowStockItems = Array.isArray(items)
      ? items
          .map((record: any) => ({
            id: record.id,
            name: record.name,
            categoryName: record.category_name || 'Uncategorized',
            currentStock: Number(record.current_stock || 0),
            minStock: Number(record.min_stock || 0)
          }))
          .filter((item) => item.currentStock <= item.minStock)
      : [];

    const stockValueByCategoryMap: Record<string, { categoryId: string; categoryName: string; value: number }> = {};
    (items || []).forEach((record: any) => {
      const categoryId = record.category_id || 'unknown';
      const categoryName = record.category_name || 'Uncategorized';
      const value = Number(record.current_stock || 0) * Number(record.price_per_unit || 0);
      if (!stockValueByCategoryMap[categoryId]) {
        stockValueByCategoryMap[categoryId] = { categoryId, categoryName, value };
      } else {
        stockValueByCategoryMap[categoryId].value += value;
      }
    });
    const stockValueByCategory = Object.values(stockValueByCategoryMap).sort((a, b) => b.value - a.value);

    const batchesQuery: any = supabase
      .from('inventory_batches')
      .select('id, item_id, batch_number, quantity, expiry_date, inventory_items(name as item_name)');
    const batchesBuilder = applyQueryBuilder(batchesQuery, [['gte', 'expiry_date', today], ['lte', 'expiry_date', threshold90], ['order', 'expiry_date', { ascending: true }]]);
    const { data: batches = [], error: batchErr } = await batchesBuilder;
    if (batchErr) handleSupabaseError(batchErr);

    const expiringBatches = (Array.isArray(batches) ? batches : []).map((record: any) => {
      const expiryDate = record.expiry_date;
      const daysRemaining = expiryDate ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return {
        id: record.id,
        itemName: record.item_name || 'Unknown item',
        batchNumber: record.batch_number,
        quantity: Number(record.quantity || 0),
        expiryDate,
        daysRemaining
      };
    });

    const totalValue = stockValueByCategory.reduce((sum, entry) => sum + entry.value, 0);
    const expiring30 = expiringBatches.filter((batch) => batch.daysRemaining <= 30).length;
    const expiring90 = expiringBatches.length;

    return {
      lowStockCount: lowStockItems.length,
      expiring30,
      expiring90,
      totalValue,
      lowStockItems,
      expiringBatches,
      stockValueByCategory
    };
  },

  async getProductStats(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const itemsQuery: any = supabase.from('invoice_items').select('reference_id, name, quantity, total, created_at');
    const itemsBuilder = applyQueryBuilder(itemsQuery, [['eq', 'item_type', 'product'], ['gte', 'created_at', f], ['lte', 'created_at', t]]);
    const { data: items = [], error } = await itemsBuilder;
    if (error) handleSupabaseError(error);
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const it of (items || [])) {
      const key = it.reference_id || it.name;
      if (!map[key]) map[key] = { name: it.name, qty: 0, revenue: 0 };
      map[key].qty += Number(it.quantity || 0);
      map[key].revenue += Number(it.total || 0);
    }
    const results = Object.entries(map).map(([ref, v]) => ({ reference: ref, name: v.name, qty: v.qty, revenue: v.revenue }));
    results.sort((a, b) => b.qty - a.qty);
    return results;
  },

  async getRevenueByService(from?: string, to?: string) {
    const f = from || '1970-01-01';
    const t = to || new Date().toISOString();
    const itemsQuery: any = supabase.from('invoice_items').select('reference_id, name, total');
    const itemsBuilder = applyQueryBuilder(itemsQuery, [['eq', 'item_type', 'service'], ['gte', 'created_at', f], ['lte', 'created_at', t]]);
    const { data: items = [], error } = await itemsBuilder;
    if (error) handleSupabaseError(error);
    const map: Record<string, number> = {};
    const names: Record<string, string> = {};
    for (const it of (items || [])) {
      const key = it.reference_id || it.name;
      map[key] = (map[key] || 0) + Number(it.total || 0);
      names[key] = it.name;
    }
    return Object.entries(map).map(([ref, amount]) => ({ serviceId: ref, serviceName: names[ref] || ref, amount }));
  }
};

export default reportsService;
