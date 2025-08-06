'use client';

import { XtreamProvider, useXtream } from '@/contexts/XtreamContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tv } from 'lucide-react';

// Componente de Login IPTV
function IPTVLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useXtream();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: 'Login Realizado',
        description: 'Autenticação IPTV realizada com sucesso!',
      });
    } catch (error) {
      console.error('Erro no login IPTV:', error);
      
      let errorMessage = 'Erro desconhecido. Tente novamente.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro de Autenticação',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Tv className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Autenticação IPTV</CardTitle>
            <CardDescription>
              Entre com suas credenciais IPTV para acessar o sistema de pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário IPTV</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu usuário IPTV"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha IPTV</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha IPTV"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Autenticando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Pedidos Cine &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// Componente principal que gerencia a autenticação
function MainContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAutoLoggingIn } = useXtream();

  if (isLoading || isAutoLoggingIn) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div>
              <h3 className="text-lg font-medium">
                {isAutoLoggingIn ? 'Conectando automaticamente...' : 'Carregando...'}
              </h3>
              <p className="text-muted-foreground">
                {isAutoLoggingIn ? 'Verificando suas credenciais IPTV' : 'Inicializando sistema'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <IPTVLoginForm />;
  }

  return <>{children}</>;
}

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <XtreamProvider>
      <MainContent>
        {children}
      </MainContent>
    </XtreamProvider>
  );
}