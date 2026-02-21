import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  Calendar,
  Clock,
  Image,
  Users,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  path: string;
  icon: React.ElementType;
  labelKey: keyof ReturnType<typeof useTranslation>['nav'];
}

const navigationItems: NavItem[] = [
  { path: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { path: '/admin/news', icon: Newspaper, labelKey: 'news' },
  { path: '/admin/careers', icon: Briefcase, labelKey: 'careers' },
  { path: '/admin/events', icon: Calendar, labelKey: 'events' },
  { path: '/admin/deadlines', icon: Clock, labelKey: 'deadlines' },
  { path: '/admin/gallery', icon: Image, labelKey: 'gallery' },
  { path: '/admin/teachers', icon: Users, labelKey: 'teachers' },
];

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export const SidebarNav = ({ collapsed = false, onNavigate }: SidebarNavProps) => {
  const location = useLocation();
  const t = useTranslation();

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const label = t.nav[item.labelKey];

    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isActive
            ? 'bg-primary text-white'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          collapsed && 'justify-center'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-1 px-2" aria-label="Main navigation">
      {navigationItems.map((item) => {
        const label = t.nav[item.labelKey];

        if (collapsed) {
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <div>
                  <NavLink item={item} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          );
        }

        return <NavLink key={item.path} item={item} />;
      })}
    </nav>
  );
};
