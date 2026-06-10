import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringService } from './monitoring.service';
import type { MonitoringQueryParams, MonitoringCreatePayload, MonitoringEntry, MonitoringUpload } from './monitoring.types';

export function useMonitoringEntries(params: MonitoringQueryParams) {
  return useQuery(['monitoring', params], () => monitoringService.getMonitoringEntries(params), {
    keepPreviousData: true
  });
}

export function usePetMonitoring(petId?: string) {
  return useQuery(['petMonitoring', petId], () => (petId ? monitoringService.getMonitoringByPet(petId) : []), {
    enabled: !!petId
  });
}

export function useMonitoringEntry(id?: string) {
  return useQuery(['monitoringEntry', id], () => (id ? monitoringService.getMonitoringEntryById(id) : null), {
    enabled: !!id
  });
}

export function useCreateMonitoringEntry() {
  const qc = useQueryClient();
  return useMutation<MonitoringEntry, Error, MonitoringCreatePayload>(
    (payload) => monitoringService.createMonitoringEntry(payload),
    {
      onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['monitoring', { petId: variables?.petId }] })
    }
  );
}

export function useUploadOwnerMedia() {
  const qc = useQueryClient();
  return useMutation<MonitoringUpload, Error, { entryId: string; upload: Pick<MonitoringUpload, 'filename' | 'url' | 'petId'> }>(
    ({ entryId, upload }) => monitoringService.uploadOwnerMedia(entryId, upload),
    {
      onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['monitoringEntry', variables.entryId] })
    }
  );
}

export function useApproveUpload() {
  const qc = useQueryClient();
  return useMutation<MonitoringUpload, Error, { id: string; status: 'approved' | 'rejected'; entryId?: string }>(
    ({ id, status }) => monitoringService.approveUpload(id, status),
    {
      onSuccess: (_data, variables) => {
        if (variables?.entryId) qc.invalidateQueries({ queryKey: ['monitoringEntry', variables.entryId] });
        qc.invalidateQueries({ queryKey: ['monitoringEntry'] });
      }
    }
  );
}
