import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useModuleStore } from '@/stores/module.store';
import type { ModuleKey } from '@/types';

interface ModuleGuardProps {
  children: ReactNode;
  moduleKey?: ModuleKey;
}

export function ModuleGuard({ children, moduleKey }: ModuleGuardProps) {
  const modules = useModuleStore((state) => state.modules);
  const isLoading = useModuleStore((state) => state.isLoading);

  if (!moduleKey) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6">Loading module configuration…</div>;
  }

  if (!modules[moduleKey]) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
