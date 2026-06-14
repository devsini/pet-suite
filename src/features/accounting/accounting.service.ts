import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type {
  Account,
  Transaction,
  TransactionQueryParams,
  TransactionPayload,
  PeriodSum,
  ProfitLossResult,
  CashFlowMonth
} from './accounting.types';

function mapAccount(record: any): Account {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    description: record.description,
    isActive: record.is_active,
    createdAt: record.created_at
  };
}

function mapTransaction(record: any): Transaction {
  return {
    id: record.id,
    accountId: record.account_id,
    accountName: record.accounts ? record.accounts.name : record.account_name || undefined,
    invoiceId: record.invoice_id,
    type: record.type,
    amount: Number(record.amount),
    description: record.description,
    reference: record.reference,
    transactionDate: record.transaction_date,
    createdAt: record.created_at
  };
}

export const accountingService = {
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase.from('accounts').select('id, name, type, description, is_active, created_at').eq('is_active', true).order('name');
    if (error) handleSupabaseError(error);
    return (data || []).map(mapAccount);
  },

  async createAccount(payload: { name: string; type: Account['type']; description?: string }): Promise<Account> {
    const { data, error } = await supabase.from('accounts').insert({ name: payload.name, type: payload.type, description: payload.description }).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create account');
    return mapAccount(data);
  },

  async updateAccount(id: string, payload: Partial<{ name: string; type: Account['type']; description?: string; isActive?: boolean }>): Promise<Account> {
    const { data, error } = await supabase.from('accounts').update(payload).eq('id', id).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to update account');
    return mapAccount(data);
  },

  async getTransactions(params: TransactionQueryParams = {}): Promise<{ items: Transaction[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('transactions')
      .select('id, account_id, invoice_id, type, amount, description, reference, transaction_date, created_at, accounts(name)', { count: 'exact' })
      .order('transaction_date', { ascending: false });

    if (params.from) query = query.gte('transaction_date', params.from);
    if (params.to) query = query.lte('transaction_date', params.to);
    if (params.type) query = query.eq('type', params.type);
    if (params.accountId) query = query.eq('account_id', params.accountId);
    if (params.search) query = query.ilike('description', `%${params.search}%`).or(`reference.ilike.%${params.search}%`);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    const items = Array.isArray(res.data) ? res.data.map(mapTransaction) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createTransaction(payload: TransactionPayload): Promise<Transaction> {
    const { data, error } = await supabase.from('transactions').insert({
      account_id: payload.accountId,
      invoice_id: payload.invoiceId || null,
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      reference: payload.reference,
      transaction_date: payload.transactionDate || new Date().toISOString().slice(0, 10)
    }).select('*, accounts(name)').single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create transaction');
    return mapTransaction(data);
  },

  async getIncomeByPeriod(from: string, to: string): Promise<PeriodSum[]> {
    const baseQuery: any = supabase.from('transactions').select('transaction_date, amount');
    const withType = typeof baseQuery.eq === 'function' ? baseQuery.eq('type', 'credit') : baseQuery;
    const withFrom = typeof withType.gte === 'function' ? withType.gte('transaction_date', from) : withType;
    const withTo = typeof withFrom.lte === 'function' ? withFrom.lte('transaction_date', to) : withFrom;
    const response = await withTo;
    const data = (response as { data?: Array<{ transaction_date: string; amount: number }>; error?: unknown }).data;
    const error = (response as { error?: unknown }).error;
    if (error) handleSupabaseError(error);
    const grouped: Record<string, number> = {};
    (data || []).forEach((r: any) => { const d = r.transaction_date; grouped[d] = (grouped[d] || 0) + Number(r.amount); });
    return Object.entries(grouped).map(([period, amount]) => ({ period, amount }));
  },

  async getExpenseByPeriod(from: string, to: string): Promise<PeriodSum[]> {
    const baseQuery: any = supabase.from('transactions').select('transaction_date, amount');
    const withType = typeof baseQuery.eq === 'function' ? baseQuery.eq('type', 'debit') : baseQuery;
    const withFrom = typeof withType.gte === 'function' ? withType.gte('transaction_date', from) : withType;
    const withTo = typeof withFrom.lte === 'function' ? withFrom.lte('transaction_date', to) : withFrom;
    const response = await withTo;
    const data = (response as { data?: Array<{ transaction_date: string; amount: number }>; error?: unknown }).data;
    const error = (response as { error?: unknown }).error;
    if (error) handleSupabaseError(error);
    const grouped: Record<string, number> = {};
    (data || []).forEach((r: any) => { const d = r.transaction_date; grouped[d] = (grouped[d] || 0) + Number(r.amount); });
    return Object.entries(grouped).map(([period, amount]) => ({ period, amount }));
  },

  async getProfitLoss(month: number, year: number): Promise<ProfitLossResult> {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);

    const incomeQuery: any = supabase.from('transactions').select('amount, account_id');
    const incomeWithType = typeof incomeQuery.eq === 'function' ? incomeQuery.eq('type', 'credit') : incomeQuery;
    const incomeWithFrom = typeof incomeWithType.gte === 'function' ? incomeWithType.gte('transaction_date', start) : incomeWithType;
    const incomeWithTo = typeof incomeWithFrom.lte === 'function' ? incomeWithFrom.lte('transaction_date', end) : incomeWithFrom;
    const incomeResponse = await incomeWithTo;
    const incomeData = (incomeResponse as { data?: Array<{ amount: number }>; error?: unknown }).data;
    const incErr = (incomeResponse as { error?: unknown }).error;
    if (incErr) handleSupabaseError(incErr);
    const income = (incomeData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    const expenseQuery: any = supabase.from('transactions').select('amount, account_id');
    const expenseWithType = typeof expenseQuery.eq === 'function' ? expenseQuery.eq('type', 'debit') : expenseQuery;
    const expenseWithFrom = typeof expenseWithType.gte === 'function' ? expenseWithType.gte('transaction_date', start) : expenseWithType;
    const expenseWithTo = typeof expenseWithFrom.lte === 'function' ? expenseWithFrom.lte('transaction_date', end) : expenseWithFrom;
    const expenseResponse = await expenseWithTo;
    const expenseData = (expenseResponse as { data?: Array<{ amount: number }>; error?: unknown }).data;
    const expErr = (expenseResponse as { error?: unknown }).error;
    if (expErr) handleSupabaseError(expErr);
    const expenses = (expenseData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    const breakdownQuery: any = supabase.from('transactions').select('account_id, type, amount');
    const breakdownWithFrom = typeof breakdownQuery.gte === 'function' ? breakdownQuery.gte('transaction_date', start) : breakdownQuery;
    const breakdownWithTo = typeof breakdownWithFrom.lte === 'function' ? breakdownWithFrom.lte('transaction_date', end) : breakdownWithFrom;
    const breakdownResponse = await breakdownWithTo;
    const breakdownData = (breakdownResponse as { data?: Array<{ account_id: string; type: 'debit' | 'credit'; amount: number }>; error?: unknown }).data ?? [];
    const brErr = (breakdownResponse as { error?: unknown }).error;
    if (brErr) handleSupabaseError(brErr);

    const breakdownMap = new Map<string, { accountName: string; type: 'debit' | 'credit'; amount: number }>();
    if (Array.isArray(breakdownData)) {
      for (const row of breakdownData) {
        const key = `${row.account_id}-${row.type}`;
        if (!breakdownMap.has(key)) {
          const { data: acc } = await supabase.from('accounts').select('name').eq('id', row.account_id).single();
          breakdownMap.set(key, { accountName: acc?.name || 'Unknown', type: row.type, amount: 0 });
        }
        const entry = breakdownMap.get(key)!;
        entry.amount += Number(row.amount);
      }
    }
    const breakdown = Array.from(breakdownMap.values());

    return { income, expenses, netProfit: income - expenses, breakdown };
  },

  async getCashFlow(year: number): Promise<CashFlowMonth[]> {
    const result: CashFlowMonth[] = [];
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1).toISOString().slice(0, 10);
      const end = new Date(year, m + 1, 0).toISOString().slice(0, 10);
      const incomeQuery: any = supabase.from('transactions').select('amount');
      const incomeWithType = typeof incomeQuery.eq === 'function' ? incomeQuery.eq('type', 'credit') : incomeQuery;
      const incomeWithFrom = typeof incomeWithType.gte === 'function' ? incomeWithType.gte('transaction_date', start) : incomeWithType;
      const incomeWithTo = typeof incomeWithFrom.lte === 'function' ? incomeWithFrom.lte('transaction_date', end) : incomeWithFrom;
      const incomeResponse = await incomeWithTo;
      const inc = (incomeResponse as { data?: Array<{ amount: number }>; error?: unknown }).data;
      const incErr = (incomeResponse as { error?: unknown }).error;
      if (incErr) handleSupabaseError(incErr);
      const income = (inc || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const expenseQuery: any = supabase.from('transactions').select('amount');
      const expenseWithType = typeof expenseQuery.eq === 'function' ? expenseQuery.eq('type', 'debit') : expenseQuery;
      const expenseWithFrom = typeof expenseWithType.gte === 'function' ? expenseWithType.gte('transaction_date', start) : expenseWithType;
      const expenseWithTo = typeof expenseWithFrom.lte === 'function' ? expenseWithFrom.lte('transaction_date', end) : expenseWithFrom;
      const expenseResponse = await expenseWithTo;
      const exp = (expenseResponse as { data?: Array<{ amount: number }>; error?: unknown }).data;
      const expErr = (expenseResponse as { error?: unknown }).error;
      if (expErr) handleSupabaseError(expErr);
      const expenses = (exp || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      result.push({ month: m + 1, income, expenses, net: income - expenses });
    }
    return result;
  }
};
