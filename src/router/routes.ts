import type { ModuleKey, UserRole } from '@/types';
import { protectedRoutes, routeMeta, publicRoutes } from '@/router/route-config';
import type { LucideIcon } from 'lucide-react';

export interface AppRouteItem {
  label: string;
  path: string;
  icon: LucideIcon;
  section: 'main' | 'clinical' | 'operations' | 'finance' | 'system';
  roles: UserRole[];
  moduleKey?: ModuleKey;
}

const buildFromRoutes = (items: { path: string; roles?: UserRole[]; moduleKey?: ModuleKey }[]) =>
  items
    .map((p) => {
      const rawKey = p.path === '/' ? 'home' : p.path.replace(/^\//, '');
      const meta = routeMeta[rawKey];
      if (!meta) return null;
      const pathWithSlash = p.path.startsWith('/') ? p.path : `/${p.path}`;
      return {
        label: meta.label,
        path: pathWithSlash,
        icon: meta.icon,
        section: meta.section,
        roles: p.roles ?? ['customer'],
        moduleKey: p.moduleKey
      } as AppRouteItem;
    })
    .filter(Boolean) as AppRouteItem[];

export const navigationRoutes: AppRouteItem[] = [
  ...buildFromRoutes(protectedRoutes),
  ...buildFromRoutes(publicRoutes as any)
];

export function filterRoutesByUser(role: UserRole | null, modules: Record<ModuleKey, boolean>) {
  return navigationRoutes.filter((route) => {
    const hasRole = route.roles.includes(role ?? 'customer');
    const moduleEnabled = route.moduleKey ? Boolean(modules[route.moduleKey]) : true;
    return hasRole && moduleEnabled;
  });
}

export function getNavigationRoutes(role: UserRole | null, modules: Record<ModuleKey, boolean>) {
  return filterRoutesByUser(role, modules);
}

export function getCommandRoutes(role: UserRole | null, modules: Record<ModuleKey, boolean>) {
  return filterRoutesByUser(role, modules);
}
