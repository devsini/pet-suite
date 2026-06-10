export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_consultation' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  queueNumber?: string | null;
  customerId: string;
  petId: string;
  doctorId?: string | null;
  service: string;
  notes?: string | null;
  scheduledAt: string; // ISO
  status: AppointmentStatus;
  createdAt?: string;
}

export interface AppointmentFormData {
  customerId: string;
  petId: string;
  service: string;
  doctorId?: string;
  scheduledAt: string;
  notes?: string;
}

export interface DoctorAvailability {
  doctorId: string;
  date: string;
  slots: string[]; // ISO times
}
