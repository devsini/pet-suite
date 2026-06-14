import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useClinicProfile } from '@/features/settings/settings.hooks';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const { data: clinic } = useClinicProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const clinicName = clinic?.name || 'PetCare Suite';
  const clinicAddress = clinic?.address || '';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/articles', label: 'Articles' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {clinicName}
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-modal animate-slide-in-left dark:bg-slate-950 p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-semibold text-gradient">{clinicName}</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <Link to="/booking" onClick={() => setMobileOpen(false)}>Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 px-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{clinicName}</p>
          {clinicAddress && <p className="mt-1">{clinicAddress}</p>}
          <p className="mt-3">&copy; {new Date().getFullYear()} {clinicName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}