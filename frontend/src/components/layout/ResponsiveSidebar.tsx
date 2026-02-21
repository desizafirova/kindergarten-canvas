import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Menu, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from './Logo';
import { SidebarNav } from './SidebarNav';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { HelpModal } from '@/components/ui/HelpModal';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

export const ResponsiveSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletExpanded, setTabletExpanded] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const t = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleMobileNavigate = () => {
    setMobileOpen(false);
  };

  const handleTabletNavigate = () => {
    setTabletExpanded(false);
  };

  // Desktop/Tablet Sidebar Content
  const SidebarContent = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => (
    <div className="flex h-full flex-col bg-background">
      {!collapsed && <Logo />}
      {collapsed && (
        <div className="py-4">
          <img
            src={logoImage}
            alt="Logo"
            className="h-8 w-8 mx-auto object-contain"
          />
        </div>
      )}

      <Separator className="my-2" />

      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />

      <Separator className="my-2" />

      {/* Settings and Logout Section */}
      <div className="p-2 space-y-1">
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setHelpOpen(true)}
                  className={cn(
                    'w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                  aria-label={t.buttons.help}
                >
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t.buttons.help}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/settings"
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t.nav.settings}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t.nav.logout}</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <button
              onClick={() => setHelpOpen(true)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
              aria-label={t.buttons.help}
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              <span>{t.buttons.help}</span>
            </button>

            <Link
              to="/admin/settings"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
              <span>{t.nav.settings}</span>
            </Link>

            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>{t.nav.logout}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button - only visible on mobile (<768px) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Admin panel navigation menu
              </SheetDescription>
            </SheetHeader>
            <Logo />
            <Separator className="my-2" />
            <SidebarNav onNavigate={handleMobileNavigate} />
            <Separator className="my-2" />
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setHelpOpen(true);
                  setMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                aria-label={t.buttons.help}
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
                <span>{t.buttons.help}</span>
              </button>
              <Link
                to="/admin/settings"
                onClick={handleMobileNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                <span>{t.nav.settings}</span>
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <LogOut className="h-5 w-5" />
                <span>{t.nav.logout}</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (240px) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border">
        <SidebarContent />
      </aside>

      {/* Tablet Sidebar (48px collapsed, 240px expanded with toggle) */}
      <aside
        className={cn(
          'hidden md:flex lg:hidden md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border transition-all duration-300',
          tabletExpanded ? 'md:w-60' : 'md:w-12'
        )}
      >
        <SidebarContent
          collapsed={!tabletExpanded}
          onNavigate={handleTabletNavigate}
        />
        {/* Toggle button for tablet expand/collapse */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTabletExpanded(!tabletExpanded)}
              className={cn(
                'absolute -right-3 top-1/2 -translate-y-1/2 z-10',
                'flex items-center justify-center w-6 h-6 rounded-full',
                'bg-background border border-border shadow-sm',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
              aria-label={tabletExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {tabletExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tabletExpanded ? 'Collapse' : 'Expand'}</p>
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* Help Modal */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
};
