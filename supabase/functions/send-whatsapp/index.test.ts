import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// mutable settings used by the mocked Supabase client
let mockSettings: any[] = [];

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        in: () => ({
          limit: () => Promise.resolve({ data: mockSettings, error: null })
        })
      })
    })
  })
}));

describe('send-whatsapp function', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-key' };
    global.fetch = vi.fn();
    // default settings for tests
    mockSettings = [
      { key: 'whatsapp_config', value: { api_key: 'k', sender_id: 's', token: 't' } },
      { key: 'service_provider', value: 'fonnte' }
    ];
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('should send via Fonnte provider', async () => {
    const mockResponse = { ok: true, json: async () => ({ success: true }), text: async () => JSON.stringify({ success: true }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { handler } = await import('./index');
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ to: '+6281234567890', message: 'Hello', provider: 'fonnte' })
    });

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, result: { success: true } });
  });

  it('should send via Wablas provider', async () => {
    const mockResponse = { ok: true, json: async () => ({ sent: true }), text: async () => JSON.stringify({ sent: true }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { handler } = await import('./index');
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ to: '+6281234567890', message: 'Hello', provider: 'wablas' })
    });

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, result: { sent: true } });
  });

  it('should return error for missing config', async () => {
    const mockFetch = { ok: true, json: async () => ({}), text: async () => JSON.stringify({}) };
    (global.fetch as any).mockResolvedValue(mockFetch);

    // simulate missing settings
    mockSettings = [];

    const { handler } = await import('./index');
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ to: '+6281234567890', message: 'Hello', provider: 'fonnte' })
    });

    const response = await handler(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain('Fonnte configuration is incomplete');
  });

  it('should return failed send error', async () => {
    const mockResponse = { ok: false, status: 400, text: async () => 'Bad request' };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { handler } = await import('./index');
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ to: '+6281234567890', message: 'Hello', provider: 'wablas' })
    });

    const response = await handler(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain('Wablas send error');
  });
});
