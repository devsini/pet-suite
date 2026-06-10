import { createTransport } from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function loadSmtpConfig() {
  const { data, error } = await supabase.from('settings').select('key, value').eq('key', 'smtp_config').single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.value;
}

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = (await request.json()) as SendEmailPayload;

  if (!payload?.to || !payload?.subject || !payload?.html) {
    return new Response('Missing required payload', { status: 400 });
  }

  const smtpConfig = await loadSmtpConfig();

  if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.user || !smtpConfig?.password) {
    return new Response(JSON.stringify({ error: 'SMTP configuration is incomplete' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const transporter = createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure ?? false,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.password
    }
  });

  try {
    const info = await transporter.sendMail({
      from: smtpConfig.from || smtpConfig.user,
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Email send failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
