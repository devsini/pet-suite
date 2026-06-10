import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinationsService } from './vaccinations.service';
import type { VaccinationsQueryParams, VaccinationCreatePayload } from './vaccinations.types';

export function useVaccinationRecords(params: VaccinationsQueryParams) {
  return useQuery(['vaccinations', params], () => vaccinationsService.getVaccinationRecords(params), {
    keepPreviousData: true
  });
}

export function usePetVaccinations(petId?: string) {
  return useQuery(['petVaccinations', petId], () => (petId ? vaccinationsService.getVaccinationsByPet(petId) : []), {
    enabled: !!petId
  });
}

export function useVaccinationRecord(id?: string) {
  return useQuery(['vaccinationRecord', id], () => (id ? vaccinationsService.getVaccinationById(id) : null), {
    enabled: !!id
  });
}

export function useCreateVaccination() {
  const qc = useQueryClient();
  return useMutation((payload: VaccinationCreatePayload) => vaccinationsService.createVaccination(payload), {
    onSuccess: (_data, variables) => qc.invalidateQueries(['vaccinations', { petId: variables.petId }])
  });
}

export function useGenerateVaccinationCertificate() {
  return useMutation((id: string) => vaccinationsService.generateCertificate(id));
}

export function useAttachVaccinationCertificate() {
  const qc = useQueryClient();
  return useMutation((vars: { id: string; url: string }) => vaccinationsService.attachCertificateUrl(vars.id, vars.url), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['vaccinationRecord', variables.id]);
      qc.invalidateQueries(['vaccinations', { petId: _data.petId }]);
    }
  });
}
