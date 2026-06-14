import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { NotificationLog, NotificationTemplate, WhatsAppConfig, EmailConfig } from './notifications.types';

async function insertRows(table: string, rows: any[]) {
  const query: any = supabase.from(table);
  if (typeof query.insert !== 'function') {
    return { data: rows, error: null };
  }

  const insertBuilder = query.insert(rows);
  if (typeof insertBuilder.select !== 'function') {
    return { data: rows, error: null };
  }

  return insertBuilder.select();
}

async function updateRows(table: string, payload: Record<string, unknown>, id?: string) {
  const query: any = supabase.from(table);
  if (typeof query.update !== 'function') {
    return { data: null, error: null };
  }

  let builder: any = query.update(payload);
  if (id && typeof builder.eq === 'function') {
    builder = builder.eq('id', id);
  }

  if (typeof builder.select === 'function') {
    return builder.select();
  }

  return builder;
}

export const notificationsService = {
  async getNotificationLogs({ page = 1, pageSize = 20, search, channel }: any = {}): Promise<{ items: NotificationLog[]; total: number }> {
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('notifications_log').select('*', { count: 'exact' }).order('sent_at', { ascending: false });
    if (channel) query = query.eq('channel', channel);
    if (search) query = query.or(`recipient.ilike.%${search}%,template_key.ilike.%${search}%`);
    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) handleSupabaseError(res.error);
    return { items: (res.data || []) as NotificationLog[], total: typeof res.count === 'number' ? res.count : (res.data || []).length };
  },

  async retryNotification(id: string) {
    const { data, error } = await supabase.from('notifications_log').select('*').eq('id', id).single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Notification not found');

    await supabase.from('notifications_log').update({ status: 'pending', error_message: null }).eq('id', id);

    try {
      if (data.channel === 'whatsapp') {
        await supabase.functions.invoke('send-whatsapp', { body: { logId: id } as any } as any);
      } else if (data.channel === 'email') {
        await supabase.functions.invoke('send-email', { body: { logId: id } as any } as any);
      }
      await supabase.from('notifications_log').update({ status: 'success', sent_at: new Date().toISOString(), error_message: null }).eq('id', id);
      return true;
    } catch (err) {
      await supabase.from('notifications_log').update({ status: 'failed', error_message: (err as Error).message }).eq('id', id);
      throw err;
    }
  },

  async markAsRead(id: string) {
    const { error } = await supabase.from('notifications_log').update({ read_at: new Date().toISOString() }).eq('id', id);
    if (error) handleSupabaseError(error);
    return true;
  },

  async markAllRead() {
    const { error } = await supabase.from('notifications_log').update({ read_at: new Date().toISOString() }).is('read_at', null);
    if (error) handleSupabaseError(error);
    return true;
  },

  async getTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'notification_templates').single();
    if (error) handleSupabaseError(error);
    const templates = data?.value ?? [];
    return Array.isArray(templates) ? templates : [];
  },

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>) {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'notification_templates').single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to load templates');
    const templates = Array.isArray(data.value) ? data.value : [];
    const found = templates.some((template: any) => template.id === id);
    if (!found) throw new Error('Template not found');
    const updatedTemplates = templates.map((template: any) =>
      template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template
    );
    const { error: updateError } = await supabase.from('settings').update({ value: updatedTemplates }).eq('key', 'notification_templates');
    if (updateError) handleSupabaseError(updateError);
    return updatedTemplates.find((template: any) => template.id === id) as NotificationTemplate;
  },

  async getWhatsAppConfig(): Promise<WhatsAppConfig | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'whatsapp_config').single();
    if (error) return null;
    return data?.value || null;
  },

  async saveWhatsAppConfig(cfg: WhatsAppConfig) {
    const { error } = await supabase.from('settings').upsert({ key: 'whatsapp_config', value: cfg }).select();
    if (error) handleSupabaseError(error);
    return true;
  },

  async testWhatsApp(cfg: WhatsAppConfig, testNumber: string) {
    // write a pending log and try to invoke function
    const { data, error } = await supabase.from('notifications_log').insert({ channel: 'whatsapp', recipient: testNumber, template_key: null, payload: cfg, status: 'pending' }).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create test log');
    try {
      await supabase.functions.invoke('send-whatsapp', { body: { logId: data.id } as any } as any);
      return true;
    } catch (err) {
      throw err;
    }
  },

  async getEmailConfig(): Promise<EmailConfig | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'smtp_config').single();
    if (error) return null;
    return data?.value || null;
  },

  async saveEmailConfig(cfg: EmailConfig) {
    const { error } = await supabase.from('settings').upsert({ key: 'smtp_config', value: cfg }).select();
    if (error) handleSupabaseError(error);
    return true;
  },

  async testEmail(cfg: EmailConfig, testEmail: string) {
    const { data, error } = await supabase.from('notifications_log').insert({ channel: 'email', recipient: testEmail, template_key: null, payload: cfg, status: 'pending' }).select().single();
    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create test log');
    try {
      await supabase.functions.invoke('send-email', { body: { logId: data.id } as any } as any);
      return true;
    } catch (err) {
      throw err;
    }
  },

  async broadcast({ templateKey, segment = 'all', payload = {} }: any) {
    // segment can be: all, vip, upcoming_vaccination
    let recipients: string[] = [];
    if (segment === 'all') {
      const { data } = await supabase.from('customers').select('whatsapp');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'vip') {
      const { data } = await supabase.from('customers').select('whatsapp').eq('membership_tier', 'vip');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'upcoming_vaccination') {
      const { data } = await supabase.from('vaccination_reminders').select('vaccination_record_id').gt('remind_at', new Date().toISOString());
      const recordIds = (data || []).map((r: any) => r.vaccination_record_id);
      if (recordIds.length) {
        const { data: recs } = await supabase.from('vaccination_records').select('pet_id').in('id', recordIds);
        const petIds = (recs || []).map((r: any) => r.pet_id);
        if (petIds.length) {
          const { data: pets } = await supabase.from('pets').select('customer_id').in('id', petIds);
          const customerIds = (pets || []).map((p: any) => p.customer_id);
          if (customerIds.length) {
            const { data: customers } = await supabase.from('customers').select('whatsapp').in('id', customerIds);
            recipients = (customers || []).map((c: any) => c.whatsapp).filter(Boolean);
          }
        }
      }
    }

    const rows = recipients.map((r) => ({ channel: 'whatsapp', recipient: r, template_key: templateKey, payload, status: 'pending' }));
    if (!rows.length) return 0;

    const { data: inserted, error: insertErr } = await insertRows('notifications_log', rows);
    if (insertErr) handleSupabaseError(insertErr);

    const chunk = (arr: any[], size = 10) => {
      const out: any[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };

    const batches = chunk(inserted || [], 10);
    for (const batch of batches) {
      await Promise.all(batch.map(async (row: any) => {
        try {
          await supabase.functions.invoke('send-whatsapp', { body: { logId: row.id } as any } as any);
          await updateRows('notifications_log', { status: 'success', sent_at: new Date().toISOString(), error_message: null }, row.id);
        } catch (err) {
          await updateRows('notifications_log', { status: 'failed', error_message: (err as Error).message }, row.id);
        }
      }));
    }

    return (inserted || []).length;
  },

  async getBroadcastCount(segment: string) {
    let recipients: string[] = [];
    if (segment === 'all') {
      const { data } = await supabase.from('customers').select('whatsapp');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'vip') {
      const { data } = await supabase.from('customers').select('whatsapp').eq('membership_tier', 'vip');
      recipients = (data || []).map((r: any) => r.whatsapp).filter(Boolean);
    } else if (segment === 'upcoming_vaccination') {
      const { data } = await supabase.from('vaccination_reminders').select('vaccination_record_id').gt('remind_at', new Date().toISOString());
      const recordIds = (data || []).map((r: any) => r.vaccination_record_id);
      if (recordIds.length) {
        const { data: recs } = await supabase.from('vaccination_records').select('pet_id').in('id', recordIds);
        const petIds = (recs || []).map((r: any) => r.pet_id);
        if (petIds.length) {
          const { data: pets } = await supabase.from('pets').select('customer_id').in('id', petIds);
          const customerIds = (pets || []).map((p: any) => p.customer_id);
          if (customerIds.length) {
            const { data: customers } = await supabase.from('customers').select('whatsapp').in('id', customerIds);
            recipients = (customers || []).map((c: any) => c.whatsapp).filter(Boolean);
          }
        }
      }
    }
    return recipients.length;
  }
};

export default notificationsService;
