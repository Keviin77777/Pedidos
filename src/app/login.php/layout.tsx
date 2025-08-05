
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';


export const metadata = {
  title: 'Pedidos Cine - Admin',
  description: 'Painel de Administração do Pedidos Cine',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="dark h-full">
        <main className="h-full bg-background text-foreground">
          {children}
        </main>
        <Toaster />
      </div>
  );
}
