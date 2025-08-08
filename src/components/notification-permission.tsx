'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const { initializeNotifications } = useNotifications();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Mostrar prompt se a permissão não foi definida
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);
      
      if (result === 'granted') {
        await initializeNotifications();
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
    }
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Ativar Notificações</CardTitle>
          </div>
          <CardDescription>
            Receba notificações sobre seus pedidos e novos conteúdos adicionados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>• Status dos seus pedidos</p>
            <p>• Novos conteúdos adicionados</p>
            <p>• Comunicados sobre seus pedidos</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={requestPermission}
              className="flex-1"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Ativar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPrompt(false)}
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
