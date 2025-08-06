
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Ticket, Sparkles, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXtream } from '@/contexts/XtreamContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserInfoDialog } from '@/components/user-info-dialog';

const navItems = [
  { href: '/', label: 'Solicitação de Conteudos', icon: Home },
  { href: '/pedidos-adicionados', label: 'Pedidos Adicionados', icon: Sparkles },
  { href: '/correcao', label: 'Correção de conteudos', icon: Wrench },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { userInfo, logout } = useXtream();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout Realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: 'Erro no Logout',
        description: 'Ocorreu um erro ao fazer logout.',
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Ticket className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Pedidos Cine</h1>
      </div>
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Seção do usuário logado */}
      <div className="p-4 border-t">
        {userInfo && (
          <div className="mb-4">
            <UserInfoDialog>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userInfo.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {userInfo.status}
                  </p>
                </div>
              </div>
            </UserInfoDialog>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
        
        <div className="text-center mt-4 text-muted-foreground text-xs">
          <p>Pedidos Cine &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
