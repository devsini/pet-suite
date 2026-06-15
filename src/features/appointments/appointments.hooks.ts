import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from './appointments.service';

export function useAppointments(params: any) {
  return useQuery(['appointments', params], () => appointmentsService.getAppointments(params), { keepPreviousData: true });
}

export function useAppointment(id?: string) {
  const query = useQuery(['appointment', id], () => (id ? appointmentsService.getAppointmentById(id) : null), { enabled: !!id, retry: false });

  if (!id) {
    return {
      ...query,
      data: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    };
  }

  return query;
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => {
      console.log('create appointment mutationFn start');
      return appointmentsService.createAppointment(payload);
    },
    onSuccess: () => {
      console.log('create appointment onSuccess');
      void qc.invalidateQueries(['appointments']);
    },
    onError: (error) => {
      console.log('create appointment onError', error);
    }
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: any) => appointmentsService.updateAppointmentStatus(id, status),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries(['appointments']);
      void qc.invalidateQueries(['appointment', variables.id]);
      void qc.invalidateQueries(['calendarAppointments']);
    }
  });
}

export function useDoctors(search?: string) {
  return useQuery(['appointmentDoctors', search], () => appointmentsService.getDoctors(search), {
    enabled: !!search || search === ''
  });
}

export function useGetDoctorAvailability(doctorId?: string, date?: string, serviceDuration?: number) {
  return useQuery(
    ['doctorAvailability', doctorId, date, serviceDuration],
    () => (doctorId && date && serviceDuration ? appointmentsService.getDoctorAvailability(doctorId, date, serviceDuration) : null),
    { enabled: !!doctorId && !!date && !!serviceDuration }
  );
}

export function useServices(search?: string) {
  return useQuery(['appointmentServices', search], () => appointmentsService.getServices(search), {
    enabled: search === undefined || search !== undefined
  });
}

export function useCalendarAppointments(from?: string, to?: string) {
  return useQuery(
    ['calendarAppointments', from, to],
    () => (from && to ? appointmentsService.getCalendarAppointments(from, to) : []),
    { enabled: !!from && !!to, keepPreviousData: true }
  );
}
