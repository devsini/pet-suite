export type CustomerStatus = 'active' | 'inactive' | 'banned';

export interface Customer {
  id: string;
  fullName: string;
  whatsapp?: string | null;
  email?: string | null;
  status: CustomerStatus;
  loyaltyPoints: number;
  registeredAt: string; // ISO date
}

export interface CustomerFormData {
  fullName: string;
  whatsapp?: string;
  email?: string;
  status?: CustomerStatus;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CustomerStatus | 'all';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}
