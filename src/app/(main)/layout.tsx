
'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { M3uProvider } from '@/contexts/M3uContext';
import LoadingOverlay from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import PageWrapper from './page-wrapper';

export default function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PageWrapper>
      <M3uProvider>
        <LoadingOverlay />
        <div className="flex h-screen bg-background text-foreground">
           {/* Desktop Sidebar */}
           <div className="hidden lg:flex lg:flex-shrink-0">
             <Sidebar />
           </div>

           {/* Mobile Sidebar */}
           <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
             <SheetContent side="left" className="p-0 w-64">
                <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                </SheetHeader>
                <Sidebar />
             </SheetContent>
           </Sheet>
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
          </div>
        </div>
        <Toaster />
      </M3uProvider>
    </PageWrapper>
  );
}
