import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { authService } from './auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setInitializing(true);

    async function restoreAuth() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        toast.error(error.message);
      }

      if (session?.user) {
        try {
          const user = await authService.fetchProfile(
            session.user.id,
            session.user.email ?? '',
          );
          setUser(user);
          setSession(session);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          toast.error(message);
        }
      }

      setIsReady(true);
      setInitializing(false);
    }

    restoreAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await authService.fetchProfile(
            session.user.id,
            session.user.email ?? '',
          );
          setUser(user);
          setSession(session);
        }

        if (event === 'SIGNED_OUT') {
          clearAuth();
          setSession(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, clearAuth, setInitializing]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l7 4v5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V7l7-4z" />
              <path d="M9.5 12.5l1.8 1.8 3.2-3.6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Memuat PetCare Suite</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {isSupabaseConfigured
              ? 'Sedang menyiapkan sesi Anda. Mohon tunggu sebentar.'
              : 'Koneksi database belum siap. Silakan cek konfigurasi Supabase di Vercel lalu muat ulang halaman.'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}