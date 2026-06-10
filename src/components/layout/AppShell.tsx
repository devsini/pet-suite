import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '@/components/common/CommandPalette';
import { useUIStore } from '@/stores/ui.store';

const routes = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Appointments', path: '/staff/appointments' },
  { label: 'Customers', path: '/staff/customers' },
  { label: 'Pets', path: '/staff/pets' },
  { label: 'Vaccinations', path: '/staff/vaccinations' },
  { label: 'Monitoring', path: '/staff/monitoring' },
  { label: 'Inventory', path: '/staff/inventory' },
  { label: 'POS', path: '/staff/pos' },
  { label: 'Billing', path: '/staff/invoices' },
  { label: 'Medical Records', path: '/doctor/medical-records' }
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const activeTheme = useUIStore((state) => state.activeTheme);

  const path = location.pathname;

  return (
    <div className={activeTheme === 'dark' ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-screen bg-slate-50 text-slate-950'}>
      <div className="lg:flex">
        <Sidebar activePath={path} onNavigate={navigate} />
        <div className="flex-1 lg:min-w-0">
          <Navbar onOpenCommand={() => setIsPaletteOpen(true)} unreadCount={3} />
          <main className="px-4 py-5 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      <CommandPalette open={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} routes={routes} />
    </div>
  );
}
