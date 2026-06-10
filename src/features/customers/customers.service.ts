import { supabase } from '@/lib/supabase';
import type { Customer, CustomerFormData, GetCustomersParams, PaginatedResult, LoyaltyTransaction } from './customers.types';

export const customersService = {
  async getCustomers(params: GetCustomersParams = {}): Promise<PaginatedResult<Customer>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('customers')
      .select('id, full_name, whatsapp, email, status, loyalty_points, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.search) {
      query = (query as any).ilike('full_name', `%${params.search}%`);
    }

    if (params.status && params.status !== 'all') {
      query = (query as any).eq('status', params.status);
    }

    const res = await (query as any).range(offset, offset + pageSize - 1);

    if (res.error) throw new Error(res.error.message);

    const items: Customer[] = (res.data || []).map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      whatsapp: r.whatsapp ?? null,
      email: r.email ?? null,
      status: r.status,
      loyaltyPoints: r.loyalty_points ?? 0,
      registeredAt: r.created_at
    }));

    return { items, total: res.count ?? items.length };
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase.from('customers').select('id, full_name, whatsapp, email, status, loyalty_points, created_at').eq('id', id).single();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      fullName: data.full_name,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points ?? 0,
      registeredAt: data.created_at
    };
  },

  async createCustomer(payload: CustomerFormData): Promise<Customer> {
    const insert = {
      full_name: payload.fullName,
      whatsapp: payload.whatsapp ?? null,
      email: payload.email ?? null,
      status: payload.status ?? 'active',
      loyalty_points: 0
    };

    const { data, error } = await supabase.from('customers').insert(insert).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      fullName: data.full_name,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points ?? 0,
      registeredAt: data.created_at
    };
  },

  async updateCustomer(id: string, updates: Partial<CustomerFormData>): Promise<Customer> {
    const payload: any = {};
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.status) payload.status = updates.status;

    const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      fullName: data.full_name,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points ?? 0,
      registeredAt: data.created_at
    };
  },

  async updateCustomerStatus(id: string, status: string): Promise<Customer> {
    const { data, error } = await supabase.from('customers').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      fullName: data.full_name,
      whatsapp: data.whatsapp ?? null,
      email: data.email ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points ?? 0,
      registeredAt: data.created_at
    };
  },

  async getCustomerPets(customerId: string) {
    const { data, error } = await supabase.from('pets').select('*').eq('owner_id', customerId);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getCustomerInvoices(customerId: string) {
    const { data, error } = await supabase.from('invoices').select('*').eq('customer_id', customerId);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getCustomerActivityLog(customerId: string) {
    const { data, error } = await supabase.from('activity_log').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async adjustLoyaltyPoints(customerId: string, amount: number, reason?: string): Promise<LoyaltyTransaction> {
    const { data, error } = await supabase.from('loyalty_transactions').insert({ customer_id: customerId, amount, reason }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      customerId: data.customer_id,
      amount: data.amount,
      reason: data.reason,
      createdAt: data.created_at
    };
  }
};

export default customersService;
