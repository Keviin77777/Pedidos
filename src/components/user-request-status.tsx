'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function UserRequestStatus() {
  const { userRequests } = useNotifications();

  const statusCounts = {
    Pendente: userRequests.filter(r => r.status === 'Pendente').length,
    Adicionado: userRequests.filter(r => r.status === 'Adicionado').length,
    Comunicado: userRequests.filter(r => r.status === 'Comunicado').length,
  };

  const totalRequests = userRequests.length;

  if (totalRequests === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Status dos Pedidos
        </h3>
        
        <div className="space-y-2">
          {statusCounts.Pendente > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-muted-foreground">Pendente</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {statusCounts.Pendente}
              </Badge>
            </div>
          )}
          
          {statusCounts.Adicionado > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Adicionado</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {statusCounts.Adicionado}
              </Badge>
            </div>
          )}
          
          {statusCounts.Comunicado > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-blue-500" />
                <span className="text-muted-foreground">Comunicado</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {statusCounts.Comunicado}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <Link 
        href="/status-pedidos"
        className="block w-full text-center text-xs text-primary hover:text-primary/80 transition-colors"
      >
        Ver todos os pedidos
      </Link>
    </div>
  );
}
