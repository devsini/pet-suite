export type UserRole = 'owner' | 'doctor' | 'staff' | 'customer';

export type ModuleKey =
  | 'clinic'
  | 'monitoring'
  | 'inpatient'
  | 'grooming'
  | 'petshop'
  | 'inventory'
  | 'accounting'
  | 'website';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blacklisted';

export type CageStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'e-wallet';

export type StockMovementType = 'inbound' | 'outbound' | 'adjustment';

export type NotificationProvider = 'email' | 'whatsapp' | 'sms';

export type ModuleStatus = Record<ModuleKey, boolean>;
