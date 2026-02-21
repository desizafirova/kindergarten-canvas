import { ReactNode } from 'react';
import { ResponsiveSidebar } from './ResponsiveSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveSidebar />

      {/* Main Content Area */}
      <main className="lg:pl-60 md:pl-12">
        <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
