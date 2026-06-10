import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

describe('customersService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
  });

  it('getCustomers returns paginated results', async () => {
    const returned = { data: [{ id: 'c1', full_name: 'Alice', whatsapp: '+62', email: 'a@b.com', status: 'active', loyalty_points: 10, created_at: '2026-01-01' }], count: 1, error: null };
    const range = vi.fn().mockResolvedValue(returned);
    const ilike = vi.fn(() => ({ range }));
    const order = vi.fn(() => ({ ilike }));
    const select = vi.fn(() => ({ order }));
    supabaseMock.from.mockReturnValue({ select });

    const { customersService } = await import('./customers.service');
    const res = await customersService.getCustomers({ page: 1, pageSize: 10, search: 'Ali' });

    expect(supabaseMock.from).toHaveBeenCalledWith('customers');
    expect(res.total).toBe(1);
    expect(res.items[0].fullName).toBe('Alice');
  });

  it('createCustomer returns created customer', async () => {
    const returned = { data: { id: 'c2', full_name: 'Bob', whatsapp: null, email: null, status: 'active', loyalty_points: 0, created_at: '2026-02-01' }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMock.from.mockReturnValue({ insert });

    const { customersService } = await import('./customers.service');
    const res = await customersService.createCustomer({ fullName: 'Bob' });

    expect(insert).toHaveBeenCalled();
    expect(res.id).toBe('c2');
    expect(res.fullName).toBe('Bob');
  });

  it('updateCustomerStatus updates status', async () => {
    const returned = { data: { id: 'c3', full_name: 'Car', whatsapp: null, email: null, status: 'inactive', loyalty_points: 0, created_at: '2026-03-01' }, error: null };
    const single = vi.fn().mockResolvedValue(returned);
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    supabaseMock.from.mockReturnValue({ update });

    const { customersService } = await import('./customers.service');
    const res = await customersService.updateCustomerStatus('c3', 'inactive');

    expect(update).toHaveBeenCalled();
    expect(res.status).toBe('inactive');
  });
});
