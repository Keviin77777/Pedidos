
'use client';

import Sidebar from '@/components/sidebar';
import { M3uProvider } from '@/contexts/M3uContext';
import LoadingOverlay from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/toaster';

export default function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <M3uProvider>
        <LoadingOverlay />
        <div className="flex h-full bg-background text-foreground">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </M3uProvider>
  );
}
