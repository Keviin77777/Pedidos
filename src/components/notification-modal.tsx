'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, MessageCircle, AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '@/lib/notifications';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ notification, isOpen, onClose }: NotificationModalProps) {
  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'request_status':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'request_added':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'communication':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'new_content':
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'request_status':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'request_added':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'communication':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'new_content':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'request_status':
        return 'Status do Pedido';
      case 'request_added':
        return 'Pedido Adicionado';
      case 'communication':
        return 'Comunicado';
      case 'new_content':
        return 'Novo Conteúdo';
      default:
        return 'Notificação';
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(notification.type)}
              <DialogTitle className="text-lg">{notification.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(notification.type)}>
              {getTypeLabel(notification.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <DialogDescription className="text-sm leading-relaxed">
            {notification.body}
          </DialogDescription>
          
          {notification.data && (
            <div className="space-y-2">
              {notification.data.contentTitle && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Conteúdo:</p>
                  <p className="text-sm text-muted-foreground">{notification.data.contentTitle}</p>
                </div>
              )}
              
              {notification.data.status && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Status:</p>
                  <p className="text-sm text-muted-foreground">{notification.data.status}</p>
                </div>
              )}
              
              {notification.data.message && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-l-4 border-blue-500">
                  <p className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                    Mensagem:
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {notification.data.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
