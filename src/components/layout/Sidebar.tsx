import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useModuleStore } from '@/stores/module.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { getNavigationRoutes } from '@/router/routes';

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ activePath, onNavigate, isMobileOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const role = useAuthStore((state) => state.role);
  const modules = useModuleStore((state) => state.modules);
  const collapseSidebar = useUIStore((state) => state.toggleSidebar);

  const sections = useMemo(() => {
    const filteredRoutes = getNavigationRoutes(role, modules);

    return filteredRoutes.reduce<Record<string, typeof filteredRoutes[number][]>>((acc, item) => {
      acc[item.section] = acc[item.section] ?? [];
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [modules, role]);

  const widthClasses = isCollapsed ? 'w-20' : 'w-72';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 shadow-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 lg:shadow-none',
        widthClasses,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-5">
        {!isCollapsed && <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Navigation</div>}
        <Button variant="outline" size="sm" onClick={onToggleCollapse ?? collapseSidebar} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="space-y-8">
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section} className="space-y-3">
            {!isCollapsed && <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{section}</h2>}
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'w-full justify-start gap-3 text-left',
                      isActive ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : '',
                      isCollapsed ? 'justify-center' : ''
                    )}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose?.();
                    }}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
