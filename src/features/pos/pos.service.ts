import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import { LOYALTY_EARN_RATE, LOYALTY_REDEEM_RATE } from '@/lib/constants';
import type { CartItem, InvoiceCreatePayload, InvoiceQueryParams } from './pos.types';

export const posService = {
  async searchProducts(query: string) {
    const q = query?.trim();
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, variant_name, price, stock, products(name)')
      .ilike('variant_name', `%${q}%`)
      .limit(50);

    if (error) handleSupabaseError(error);
    return (data || []).map((row: any) => ({
      id: row.id,
      name: `${row.products?.name ?? ''} ${row.variant_name ?? ''}`.trim(),
      price: Number(row.price),
      stock: Number(row.stock),
      variantName: row.variant_name
    }));
  },

  async searchServices(query: string) {
    const q = query?.trim();
    const { data, error } = await supabase.from('services').select('id,name,price,category').ilike('name', `%${q}%`).limit(50);
    if (error) handleSupabaseError(error);
    return (data || []).map((r: any) => ({ id: r.id, name: r.name, price: Number(r.price), category: r.category }));
  },

  async getInvoices(params: InvoiceQueryParams = {}) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;

    let query: any = supabase.from('invoices').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.or(`invoice_number.ilike.%${params.search}%,notes.ilike.%${params.search}%`);
    if (params.paymentMethod) query = query.eq('payment_method', params.paymentMethod);
    if (params.dateFrom) query = query.gte('created_at', params.dateFrom);
    if (params.dateTo) query = query.lte('created_at', params.dateTo);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    return { items: res.data || [], total: typeof res.count === 'number' ? res.count : (res.data || []).length };
  },

  async getInvoiceById(id: string) {
    const invoiceQuery: any = supabase.from('invoices');
    const selectBuilder = typeof invoiceQuery.select === 'function'
      ? invoiceQuery.select('*, invoice_items(*), refunds(*)')
      : invoiceQuery;
    const eqBuilder = typeof selectBuilder.eq === 'function'
      ? selectBuilder.eq('id', id)
      : selectBuilder;
    const response = typeof eqBuilder.single === 'function'
      ? await eqBuilder.single()
      : await eqBuilder;
    const data = (response as { data?: any; error?: unknown }).data;
    const error = (response as { error?: unknown }).error;
    if (error) handleSupabaseError(error);
    if (!data) return null;
    return {
      ...data,
      items: data.invoice_items ?? [],
      refunds: data.refunds ?? []
    };
  },

  async getInvoiceByInpatientRecord(inpatientRecordId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('inpatient_record_id', inpatientRecordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) handleSupabaseError(error);
    return data || null;
  },

  async createInvoice(payload: InvoiceCreatePayload) {
    const { data, error } = await supabase.from('invoices').insert({
      invoice_number: payload.invoice_number ?? `INV-${Date.now()}`,
      customer_id: payload.customer_id,
      appointment_id: payload.appointment_id,
      inpatient_record_id: payload.inpatient_record_id,
      subtotal: payload.subtotal,
      discount_amount: payload.discount_amount,
      loyalty_points_used: payload.loyalty_points_used,
      loyalty_discount_amount: payload.loyalty_discount_amount,
      total: payload.total,
      payment_method: payload.payment_method,
      payment_method_secondary: payload.payment_method_secondary,
      paid_amount: payload.paid_amount,
      change_amount: payload.change_amount,
      status: payload.status,
      notes: payload.notes,
      created_by: payload.created_by
    }).select().single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create invoice');

    const invoiceId = data.id;

    if (payload.items && payload.items.length) {
      const rows = payload.items.map((it) => ({
        invoice_id: invoiceId,
        item_type: it.item_type,
        reference_id: it.reference_id,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        discount: it.discount,
        total: it.total
      }));

      const { error: insErr } = await supabase.from('invoice_items').insert(rows);
      if (insErr) handleSupabaseError(insErr);
    }

    // decrement stock for product items
    for (const it of payload.items || []) {
      try {
        if (it.item_type === 'product' && it.reference_id) {
          const { data: variant } = await supabase.from('product_variants').select('stock').eq('id', it.reference_id).single();
          if (variant) {
            const newStock = Math.max(0, (variant.stock || 0) - it.quantity);
            await supabase.from('product_variants').update({ stock: newStock }).eq('id', it.reference_id);
          }
        }
      } catch (err) {
        if ((err as any)?.message) throw err;
        handleSupabaseError(err as any);
      }
    }

    // award loyalty points
    if (payload.customer_id) {
      try {
        const earned = Math.floor((payload.total || 0) / 1000) * (LOYALTY_EARN_RATE || 1);
        if (earned > 0) {
          const { data: customer } = await supabase.from('customers').select('loyalty_points').eq('id', payload.customer_id).single();
          if (customer) {
            const newPoints = (customer.loyalty_points || 0) + earned;
            const { error } = await supabase.from('customers').update({ loyalty_points: newPoints }).eq('id', payload.customer_id);
            if (error) handleSupabaseError(error);
          }
        }
      } catch (err) {
        if ((err as any)?.message) throw err;
        handleSupabaseError(err as any);
      }
    }

    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice) return invoice;

    return {
      id: invoiceId,
      total: payload.total,
      items: payload.items || [],
      refunds: [],
    };
  },

  async processRefund({ invoiceId, amount, reason, processedBy }: any) {
    const refundQuery: any = supabase.from('refunds');
    const insertBuilder = typeof refundQuery.insert === 'function'
      ? refundQuery.insert({ invoice_id: invoiceId, amount, reason, processed_by: processedBy })
      : refundQuery;
    const selectBuilder = typeof insertBuilder.select === 'function' ? insertBuilder.select() : insertBuilder;
    const singleBuilder = typeof selectBuilder.single === 'function' ? selectBuilder.single() : selectBuilder;
    const { data, error } = await singleBuilder;
    if (error) handleSupabaseError(error);

    const invoiceQuery: any = supabase.from('invoices');
    const updateBuilder = typeof invoiceQuery.update === 'function'
      ? invoiceQuery.update({ status: 'refunded' })
      : invoiceQuery;
    const updateEqBuilder = typeof updateBuilder.eq === 'function' ? updateBuilder.eq('id', invoiceId) : updateBuilder;
    const { error: updErr } = await updateEqBuilder;
    if (updErr) handleSupabaseError(updErr);
    return data;
  },

  async getInpatientPendingBill(inpatientRecordId: string) {
    // aggregate medications and services for inpatient record
    const meds = await supabase.from('inpatient_medications').select('id,name,unit_price,quantity').eq('inpatient_record_id', inpatientRecordId);
    const services = await supabase.from('inpatient_services').select('id,name,price').eq('inpatient_record_id', inpatientRecordId);

    const items: CartItem[] = [];
    if (meds.data) {
      for (const m of meds.data) {
        items.push({ id: `med-${m.id}`, name: m.name, itemType: 'product', referenceId: m.id, unitPrice: Number(m.unit_price), quantity: m.quantity, discountAmount: 0, total: Number(m.unit_price) * Number(m.quantity) });
      }
    }
    if (services.data) {
      for (const s of services.data) {
        items.push({ id: `svc-${s.id}`, name: s.name, itemType: 'service', referenceId: s.id, unitPrice: Number(s.price), quantity: 1, discountAmount: 0, total: Number(s.price) });
      }
    }

    return items;
  },

  async validateLoyaltyRedeem(customerId: string, points: number) {
    const { data, error } = await supabase.from('customers').select('loyalty_points').eq('id', customerId).single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Customer not found');
    const available = Number(data.loyalty_points || 0);
    if (available < points) return { valid: false, available, discount: 0 };
    return { valid: true, available, discount: points * (LOYALTY_REDEEM_RATE || 100) };
  },

  async applyLoyaltyRedeem(customerId: string, points: number) {
    const customerQuery: any = supabase.from('customers');
    const selectBuilder = typeof customerQuery.select === 'function'
      ? customerQuery.select('loyalty_points')
      : customerQuery;
    const eqBuilder = typeof selectBuilder.eq === 'function'
      ? selectBuilder.eq('id', customerId)
      : selectBuilder;
    const response = typeof eqBuilder.single === 'function'
      ? await eqBuilder.single()
      : await eqBuilder;
    const customer = (response as { data?: any }).data;
    if (customer) {
      const newPoints = Math.max(0, (customer.loyalty_points || 0) - points);
      const updateBuilder: any = supabase.from('customers');
      const updateQuery = typeof updateBuilder.update === 'function'
        ? updateBuilder.update({ loyalty_points: newPoints })
        : updateBuilder;
      const updateEqBuilder = typeof updateQuery.eq === 'function'
        ? updateQuery.eq('id', customerId)
        : updateQuery;
      const updateResponse = typeof updateEqBuilder.then === 'function'
        ? await updateEqBuilder
        : { error: null };
      const error = (updateResponse as { error?: unknown }).error;
      if (error) handleSupabaseError(error);
    }
    return true;
  }
};
