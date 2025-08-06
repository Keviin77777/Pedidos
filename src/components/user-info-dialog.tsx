'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Clock, Shield, Users, Tv, Info } from 'lucide-react';
import { useXtream } from '@/contexts/XtreamContext';

export function UserInfoDialog({ children }: { children: React.ReactNode }) {
  const { userInfo } = useXtream();

  if (!userInfo) {
    return <>{children}</>;
  }

  // Formatar data de vencimento
  const formatExpDate = (expDate: string | null) => {
    if (!expDate || expDate === "0" || expDate === null) {
      return 'Sem vencimento';
    }
    try {
      const date = new Date(parseInt(expDate) * 1000);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Formatar data de criação
  const formatCreatedDate = (createdAt: string) => {
    try {
      const date = new Date(parseInt(createdAt) * 1000);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Verificar se a conta está expirada
  const isExpired = () => {
    if (!userInfo.exp_date || userInfo.exp_date === "0" || userInfo.exp_date === null) {
      return false;
    }
    try {
      const expDate = new Date(parseInt(userInfo.exp_date) * 1000);
      return expDate < new Date();
    } catch (error) {
      return false;
    }
  };

  // Obter status da conta
  const getAccountStatus = () => {
    if (isExpired()) {
      return { label: 'Expirada', variant: 'destructive' as const };
    }
    if (userInfo.status === 'Active') {
      return { label: 'Ativa', variant: 'default' as const };
    }
    return { label: userInfo.status, variant: 'secondary' as const };
  };

  const accountStatus = getAccountStatus();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações da Conta IPTV
          </DialogTitle>
          <DialogDescription>
            Detalhes completos da sua conta de acesso ao sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Principal do Usuário */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{userInfo.username}</CardTitle>
                <Badge variant={accountStatus.variant}>
                  {accountStatus.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informações de Acesso */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Senha</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {'•'.repeat(userInfo.password.length)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data de Vencimento</p>
                    <p className={`text-sm ${isExpired() ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {formatExpDate(userInfo.exp_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Conta Criada em</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCreatedDate(userInfo.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informações Técnicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Conexões</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userInfo.active_cons}/{userInfo.max_connections}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tipo de Conta</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userInfo.is_trial === "1" ? 'Trial' : 'Premium'}
                  </p>
                </div>
              </div>

              {/* Formatos Suportados */}
              {userInfo.allowed_output_formats && userInfo.allowed_output_formats.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Formatos Suportados</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {userInfo.allowed_output_formats.map((format, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Informações do Servidor */}
          {userInfo.server_info && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Servidor IPTV</CardTitle>
                <CardDescription className="text-sm">
                  Informações do servidor de conexão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">URL:</p>
                    <p className="text-muted-foreground">{userInfo.server_info.url}</p>
                  </div>
                  <div>
                    <p className="font-medium">Porta:</p>
                    <p className="text-muted-foreground">{userInfo.server_info.port}</p>
                  </div>
                  <div>
                    <p className="font-medium">Protocolo:</p>
                    <p className="text-muted-foreground">{userInfo.server_info.server_protocol}</p>
                  </div>
                  <div>
                    <p className="font-medium">Timezone:</p>
                    <p className="text-muted-foreground">{userInfo.server_info.timezone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}