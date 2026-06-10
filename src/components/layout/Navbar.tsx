import { Bell, Menu, Moon, Sun, LogOut, Search, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { useAuthActions } from '@/features/auth/auth.hooks';

interface NavbarProps {
  onOpenCommand: () => void;
  unreadCount: number;
}

export function Navbar({ onOpenCommand, unreadCount }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthActions();
  const setTheme = useUIStore((state) => state.setTheme);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setIsOpen((open) => !open)}>
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenCommand}>
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setTheme(activeTheme === 'light' ? 'dark' : 'light')} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
          {activeTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />}
        </button>
        <div className="relative">
          <button onClick={() => setIsOpen((current) => !current)} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900">
            <UserCircle className="h-5 w-5" />
            <span>{user?.fullName ?? 'User'}</span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <button onClick={() => navigate('/profile')} className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <UserCircle className="h-4 w-4" />
                Profile
              </button>
              <button onClick={() => { signOut(); }} className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
