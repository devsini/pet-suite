import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from './customers.service';
import type { GetCustomersParams, CustomerFormData } from './customers.types';

export function useCustomers(params: GetCustomersParams) {
  return useQuery(['customers', params], () => customersService.getCustomers(params), { keepPreviousData: true });
}

export function useCustomer(id?: string) {
  return useQuery(['customer', id], () => (id ? customersService.getCustomerById(id) : null), { enabled: !!id });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation((payload: CustomerFormData) => customersService.createCustomer(payload), {
    onSuccess: () => qc.invalidateQueries(['customers'])
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: any) => customersService.updateCustomer(id, updates), {
    onSuccess: (_data, vars) => qc.invalidateQueries(['customer', vars.id])
  });
}

export function useUpdateCustomerStatus() {
  const qc = useQueryClient();
  return useMutation(({ id, status }: any) => customersService.updateCustomerStatus(id, status), {
    onSuccess: () => qc.invalidateQueries(['customers'])
  });
}
