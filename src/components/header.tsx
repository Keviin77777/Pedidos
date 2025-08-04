
'use client';

import { Menu } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-card/30 backdrop-blur-lg border-b sticky top-0 z-10 lg:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-4">
           <Menu className="h-6 w-6" />
           <span className="sr-only">Abrir Menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
