
'use client';

import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationBell } from './notification-bell';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu button - apenas mobile */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-4 lg:hidden">
           <Menu className="h-6 w-6" />
           <span className="sr-only">Abrir Menu</span>
        </Button>
        
        {/* Título - apenas desktop */}
        <div className="hidden lg:flex items-center">
          <h1 className="text-xl font-bold tracking-tight">Pedidos Cine</h1>
        </div>
        
        {/* Notificações - sempre visível */}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};

export default Header;
