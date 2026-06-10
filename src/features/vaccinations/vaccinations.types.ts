export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDue?: string | null;
  veterinarianId: string;
  notes?: string | null;
  certificateUrl?: string | null;
}

export interface VaccinationCreatePayload {
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDue?: string | null;
  veterinarianId: string;
  notes?: string;
}

export interface VaccinationsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  petId?: string;
}

export interface VaccinationCertificate {
  url: string;
  fileName: string;
  issuedAt: string;
}
