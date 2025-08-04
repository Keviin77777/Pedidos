
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'CineAssist - Admin',
  description: 'Painel de Administração do CineAssist',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="font-body antialiased h-full bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
