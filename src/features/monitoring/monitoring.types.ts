export interface MonitoringUpload {
  id: string;
  entryId: string;
  petId: string;
  filename: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export interface MonitoringEntry {
  id: string;
  petId: string;
  date: string;
  weightKg: number;
  medicationPlan: string;
  recoveryNotes: string;
  nextCheck?: string | null;
  uploads: MonitoringUpload[];
}

export interface MonitoringCreatePayload {
  petId: string;
  date: string;
  weightKg: number;
  medicationPlan: string;
  recoveryNotes: string;
  nextCheck?: string | null;
  uploads?: Array<Pick<MonitoringUpload, 'filename' | 'url' | 'petId'>>;
}

export interface MonitoringQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  petId?: string;
}
