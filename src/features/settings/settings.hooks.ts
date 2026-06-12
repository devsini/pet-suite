import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseQuery, useSupabaseMutation, useToast } from '@/hooks';
import { settingsService } from './settings.service';
import type { AuditLogFilter, AuditLogResult, BusinessHoursSettings, EmailSettings, InvoiceSettings, ModuleRecord, ServiceTestResult, WhatsAppSettings, ClinicProfile } from './settings.types';

export function useClinicProfile() {
  return useSupabaseQuery(['settings', 'clinicProfile'], () => settingsService.getClinicProfile());
}

export function useUpdateClinicProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation((profile: Partial<ClinicProfile>) => settingsService.updateClinicProfile(profile), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'clinicProfile']);
      toast.success('Clinic profile updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update clinic profile');
    }
  });
}

export function useBusinessHours() {
  return useSupabaseQuery(['settings', 'businessHours'], () => settingsService.getBusinessHours());
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation((hours: BusinessHoursSettings) => settingsService.updateBusinessHours(hours), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'businessHours']);
      toast.success('Business hours updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update business hours');
    }
  });
}

export function useInvoiceSettings() {
  return useSupabaseQuery(['settings', 'invoiceSettings'], () => settingsService.getInvoiceSettings());
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation((settings: Partial<InvoiceSettings>) => settingsService.updateInvoiceSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'invoiceSettings']);
      toast.success('Invoice settings updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update invoice settings');
    }
  });
}

export function useWhatsAppSettings() {
  return useSupabaseQuery(['settings', 'whatsappSettings'], () => settingsService.getWhatsAppSettings());
}

export function useSaveWhatsAppSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation((settings: WhatsAppSettings) => settingsService.saveWhatsAppSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'whatsappSettings']);
      toast.success('WhatsApp settings saved');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to save WhatsApp settings');
    }
  });
}

export function useEmailSettings() {
  return useSupabaseQuery(['settings', 'emailSettings'], () => settingsService.getEmailSettings());
}

export function useSaveEmailSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation((settings: EmailSettings) => settingsService.saveEmailSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'emailSettings']);
      toast.success('Email settings saved');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to save email settings');
    }
  });
}

export function useModules() {
  return useSupabaseQuery(['settings', 'modules'], () => settingsService.getModules());
}

export function useToggleModule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useSupabaseMutation(({ key, isEnabled }: { key: string; isEnabled: boolean }) => settingsService.toggleModule(key, isEnabled), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'modules']);
      toast.success('Module updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update module');
    }
  });
}

export function useTestWhatsApp() {
  const toast = useToast();
  return useSupabaseMutation((number: string) => settingsService.testWhatsApp(number), {
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to send WhatsApp test');
    }
  });
}

export function useTestEmail() {
  const toast = useToast();
  return useSupabaseMutation((email: string) => settingsService.testEmail(email), {
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to send email test');
    }
  });
}

export function useAuditLogs(filters: AuditLogFilter = {}) {
  return useQuery(['settings', 'auditLogs', filters], () => settingsService.getAuditLogs(filters));
}

export default {};
