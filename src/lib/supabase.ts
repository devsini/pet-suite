import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

function createFallbackSupabaseClient() {
  const createError = () => new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');

  const createQueryBuilder = () => ({
    select: () => createQueryBuilder(),
    insert: () => createQueryBuilder(),
    update: () => createQueryBuilder(),
    delete: () => createQueryBuilder(),
    eq: () => createQueryBuilder(),
    gte: () => createQueryBuilder(),
    lte: () => createQueryBuilder(),
    order: () => createQueryBuilder(),
    in: () => createQueryBuilder(),
    limit: () => createQueryBuilder(),
    single: async () => ({ data: null, error: createError() }),
    maybeSingle: async () => ({ data: null, error: createError() }),
  });

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: createError() }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: { user: null }, error: createError() }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
        error: null,
      }),
    },
    from: () => createQueryBuilder(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: createError() }),
        createSignedUrl: async () => ({ data: null, error: createError() }),
        remove: async () => ({ data: null, error: createError() }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => undefined }) }),
      subscribe: () => ({ unsubscribe: () => undefined }),
    }),
    removeChannel: () => undefined,
  };
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackSupabaseClient();
