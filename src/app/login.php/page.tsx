'use client';

import { useState } from 'react';
import AdminDashboard from '@/components/admin-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdmin, AdminProvider } from '@/contexts/AdminContext';
import { Toaster } from '@/components/ui/toaster';

function AdminLoginPageContent() {
  const { credentials, isAuthenticated, setIsAuthenticated } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Verificar credenciais do contexto (Firebase)
    if (credentials && username === credentials.username && password === credentials.password) {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 500);
    } else {
      toast({
        title: 'Erro de Autenticação',
        description: 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="h-screen">
        <AdminDashboard />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
             <Shield className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel Admin</CardTitle>
          <CardDescription>
            Faça login para gerenciar o conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminProvider>
      <div className="dark h-full">
        <main className="h-full bg-background text-foreground">
          <AdminLoginPageContent />
        </main>
        <Toaster />
      </div>
    </AdminProvider>
  );
}