import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from './appointments.service';

export function useAppointments(params: any) {
  return useQuery(['appointments', params], () => appointmentsService.getAppointments(params), { keepPreviousData: true });
}

export function useAppointment(id?: string) {
  return useQuery(['appointment', id], () => (id ? appointmentsService.getAppointmentById(id) : null), { enabled: !!id });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation((payload: any) => appointmentsService.createAppointment(payload), { onSuccess: () => qc.invalidateQueries(['appointments']) });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation(({ id, status }: any) => appointmentsService.updateAppointmentStatus(id, status), { onSuccess: () => qc.invalidateQueries(['appointments']) });
}

export function useGetDoctorAvailability(doctorId?: string, date?: string) {
  return useQuery(['doctorAvailability', doctorId, date], () => (doctorId && date ? appointmentsService.getDoctorAvailability(doctorId, date) : null), { enabled: !!doctorId && !!date });
}
