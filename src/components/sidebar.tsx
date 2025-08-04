
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard, Home, Wrench, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Solicitação de Conteudos', icon: Home },
  { href: '/correcao', label: 'Correção de conteudos', icon: Wrench },
  { href: '/admin', label: 'Painel Admin', icon: Shield },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Clapperboard className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">CineAssist</h1>
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
      <footer className="text-center p-4 text-muted-foreground text-xs border-t">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
