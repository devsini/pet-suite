import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  routes?: { label: string; path: string }[];
}

const pages = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customers', path: '/staff/customers' },
  { label: 'Pets', path: '/staff/pets' }
];

export function CommandPalette({ open, onClose, routes }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const availablePages = routes ?? pages;

  const filtered = useMemo(
    () => availablePages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase())),
    [availablePages, query]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Search className="h-5 w-5" />
            <span className="text-sm font-semibold">Search pages, customers, pets</span>
          </div>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-800"
            placeholder="Type a command or search..."
            autoFocus
            aria-label="Search"
          />
          <div className="mt-4 max-h-72 space-y-2 overflow-auto">
            {filtered.map((item, index) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  activeIndex === index ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
            {!filtered.length && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">No matching results.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
