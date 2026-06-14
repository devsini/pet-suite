import { Bell, Menu, Moon, Sun, LogOut, Search, UserCircle, Inbox } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { useAuthActions } from '@/features/auth/auth.hooks';
import { supabase } from '@/lib/supabase';

interface NotificationItem {
  id: string;
  channel: string;
  recipient: string;
  template_key?: string | null;
  payload: any;
  status: string;
  error_message?: string | null;
  sent_at?: string | null;
  created_at: string;
  isRead?: boolean;
}

interface NavbarProps {
  onOpenCommand: () => void;
  onToggleSidebar: () => void;
}

export function Navbar({ onOpenCommand, onToggleSidebar }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthActions();
  const setTheme = useUIStore((state) => state.setTheme);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoadingNotifications(false);
      return;
    }

    let isMounted = true;

    async function loadNotifications() {
      if (!user) return;
      setIsLoadingNotifications(true);
      const { data, error } = await supabase
        .from('notifications_log')
        .select('id, channel, recipient, template_key, payload, status, error_message, sent_at, created_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (isMounted) {
        setNotifications((data || []).map((item) => ({ ...item, isRead: false })));
        setIsLoadingNotifications(false);
      }
    }

    loadNotifications();

    const channel = supabase
      .channel(`notifications-log-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications_log', filter: `user_id=eq.${user.id}` },
        ({ new: newRecord }) => {
          if (!newRecord || !isMounted) {
            return;
          }

          const typedRecord = newRecord as NotificationItem;
          setNotifications((current) => [{ ...typedRecord, isRead: false }, ...current].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  };

  return (
    <div
      data-navbar
      className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80 lg:px-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} aria-label="Open navigation menu">
          <Menu className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition-all duration-200 hover:border-slate-300 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:text-slate-300"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-8 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
            Ctrl+K
          </kbd>
        </button>
        <Button variant="ghost" size="sm" onClick={onOpenCommand} className="sm:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(activeTheme === 'light' ? 'dark' : 'light')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {activeTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-modal animate-scale-in dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
                <span>Notifications</span>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {isLoadingNotifications ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse-soft rounded-xl bg-slate-100 p-3 dark:bg-slate-800 h-16" />
                    ))}
                  </div>
                ) : notifications.length ? (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-xl border border-slate-100 bg-white p-3 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 ${
                          notification.isRead ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                              <Inbox className="h-4 w-4" />
                              <span className="font-semibold">{notification.template_key ?? notification.channel}</span>
                            </div>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">
                              {notification.payload?.message ?? notification.recipient}
                            </p>
                            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                              {notification.sent_at ?? notification.created_at}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <button
                              type="button"
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="inline-flex h-9 items-center gap-2 rounded-xl px-2 text-sm text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold text-white shadow-sm">
              {(user?.fullName ?? 'U').slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-medium">{user?.fullName ?? 'User'}</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1 shadow-modal animate-scale-in dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-10 lg:hidden"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}