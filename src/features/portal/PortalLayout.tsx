import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PawPrint, Calendar, FileText, UserCircle, Bed, Scissors, Bell } from 'lucide-react';

const navItems = [
  { to: '/portal', label: 'Overview', icon: LayoutDashboard },
  { to: '/portal/pets', label: 'Pets', icon: PawPrint },
  { to: '/portal/appointments', label: 'Appointments', icon: Calendar },
  { to: '/portal/invoices', label: 'Invoices', icon: FileText },
  { to: '/portal/profile', label: 'Profile', icon: UserCircle },
  { to: '/portal/inpatient', label: 'Inpatient', icon: Bed },
  { to: '/portal/grooming', label: 'Grooming', icon: Scissors },
  { to: '/portal/notifications', label: 'Notifications', icon: Bell }
];

export default function PortalLayout() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between max-w-6xl">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Customer Portal</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {user?.fullName ?? 'Customer'}</h1>
          </div>
          <nav className="flex flex-wrap gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/portal' && location.pathname.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}