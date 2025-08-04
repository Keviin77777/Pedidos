
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/sidebar';
import { M3uProvider } from '@/contexts/M3uContext';
import LoadingOverlay from '@/components/loading-overlay';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="font-body antialiased h-full">
        <M3uProvider>
          <LoadingOverlay />
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </M3uProvider>
        <Toaster />
      </body>
    </html>
  );
}
