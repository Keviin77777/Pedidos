'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Settings, Cloud, Key, LogOut } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export function AdminSettingsDialog() {
  const { credentials, updateCredentials, isLoading, isReady, setIsAuthenticated } = useAdmin();
  const { toast } = useToast();
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUsername, setNewUsername] = useState(credentials?.username || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Atualizar o username quando as credenciais mudarem
  useEffect(() => {
    if (credentials?.username) {
      setNewUsername(credentials.username);
    }
  }, [credentials]);

  // Não renderizar se o contexto ainda não estiver pronto
  if (!isReady || !credentials || !updateCredentials) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (newUsername.trim().length < 3) {
      toast({
        title: 'Usuário muito curto',
        description: 'O usuário deve ter pelo menos 3 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 4 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas digitadas não são iguais.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCredentials({
        username: newUsername.trim(),
        password: newPassword,
      });

      toast({
        title: 'Configurações Atualizadas!',
        description: 'Suas credenciais foram alteradas com sucesso e sincronizadas globalmente.',
      });
      
      setIsCredentialsDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao atualizar credenciais:', error);
      toast({
        title: 'Erro ao Atualizar',
        description: 'Não foi possível atualizar as configurações. Verifique sua conexão com a internet.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Menu Dropdown de Configurações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Settings className="h-4 w-4" />
            {isLoading && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse">
                <Cloud className="w-2 h-2 text-white" />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setIsCredentialsDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            <span>Alterar Credenciais</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de Alterar Credenciais */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Alterar Credenciais</DialogTitle>
              <DialogDescription>
                Altere o usuário e senha do painel administrativo. As mudanças serão sincronizadas globalmente em todos os dispositivos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Usuário
                </Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="col-span-3"
                  placeholder="admin"
                  disabled={isSubmitting || isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Nova Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="********"
                  disabled={isSubmitting || isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="********"
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting || isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}