import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface ContentFormShellProps {
  breadcrumbItems: BreadcrumbItemData[];
  actionButtons?: React.ReactNode;
  autoSaveIndicator?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ContentFormShell: React.FC<ContentFormShellProps> = ({
  breadcrumbItems,
  actionButtons,
  autoSaveIndicator,
  children,
  className,
}) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;

                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast || !item.href ? (
                          <BreadcrumbPage className="font-medium">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            {autoSaveIndicator && (
              <div className="flex-shrink-0">{autoSaveIndicator}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container max-w-4xl py-8">
        <div className={cn('space-y-6', className)}>{children}</div>
      </main>

      {/* Sticky Action Bar */}
      {actionButtons && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="container max-w-4xl py-4">
            <div className="flex items-center justify-end gap-3">
              {actionButtons}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
