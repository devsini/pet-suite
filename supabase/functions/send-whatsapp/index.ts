import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

interface SendWhatsAppPayload {
  to: string;
  message: string;
  provider: 'fonnte' | 'wablas';
}

async function loadSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['whatsapp_config', 'service_provider'])
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return Object.fromEntries(data?.map((row) => [row.key, row.value]) ?? []);
}

async function sendWithFonnte(config: any, to: string, message: string) {
  if (!config?.api_key || !config?.sender_id) {
    throw new Error('Fonnte configuration is incomplete');
  }

  const response = await fetch('https://api.fonnte.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.api_key}`
    },
    body: JSON.stringify({
      sender: config.sender_id,
      recipient: to,
      message
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fonnte send error: ${response.status} ${body}`);
  }

  return response.json();
}

async function sendWithWablas(config: any, to: string, message: string) {
  if (!config?.token) {
    throw new Error('Wablas configuration is incomplete');
  }

  const response = await fetch('https://console.wablas.com/api/v2/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`
    },
    body: JSON.stringify({
      phone: to,
      message
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Wablas send error: ${response.status} ${body}`);
  }

  return response.json();
}

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = (await request.json()) as SendWhatsAppPayload;

  if (!payload?.to || !payload?.message || !payload?.provider) {
    return new Response('Missing required payload', { status: 400 });
  }

  const settings = await loadSettings();
  const whatsappConfig = settings['whatsapp_config'];

  let result;
  try {
    if (payload.provider === 'fonnte') {
      result = await sendWithFonnte(whatsappConfig, payload.to, payload.message);
    } else {
      result = await sendWithWablas(whatsappConfig, payload.to, payload.message);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
