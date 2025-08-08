'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, MessageCircle, AlertCircle, Calendar, Tag, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { deleteUserRequest } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { useXtream } from '@/contexts/XtreamContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function StatusPedidosPage() {
  const { userRequests, isLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { userInfo } = useXtream();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Adicionado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Comunicado':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Adicionado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Comunicado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredRequests = userRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const statusCounts = {
    all: userRequests.length,
    Pendente: userRequests.filter(r => r.status === 'Pendente').length,
    Adicionado: userRequests.filter(r => r.status === 'Adicionado').length,
    Comunicado: userRequests.filter(r => r.status === 'Comunicado').length,
  };

  const handleRemoveRequest = async (requestId: string) => {
    try {
      await deleteUserRequest(requestId);
      toast({
        title: 'Pedido Removido',
        description: 'O pedido foi completamente removido do sistema.',
      });
    } catch (error) {
      console.error('Erro ao remover pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o pedido.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Status dos Pedidos</h1>
        <p className="text-muted-foreground">
          Acompanhe o status de todos os seus pedidos de conteúdo.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 gap-2 p-1">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1">
            Todos
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Pendente" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Pendente</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.Pendente}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Adicionado" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Adicionado</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.Adicionado}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Comunicado" className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Comunicado</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {statusCounts.Comunicado}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'all' 
                    ? 'Nenhum pedido encontrado' 
                    : `Nenhum pedido ${activeTab.toLowerCase()}`
                  }
                </h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'all' 
                    ? 'Você ainda não fez nenhum pedido. Comece fazendo uma solicitação de conteúdo!'
                    : `Você não tem pedidos com status "${activeTab}".`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{request.requestTitle}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          Pedido em {formatDistanceToNow(new Date(request.requestedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </CardDescription>
                      </div>
                                             <div className="flex items-center gap-2">
                         {getStatusIcon(request.status)}
                         <Badge className={getStatusColor(request.status)}>
                           {request.status}
                         </Badge>
                         
                         {/* Botão de remover pedido */}
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-muted-foreground hover:text-destructive"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Remover Pedido</AlertDialogTitle>
                               <AlertDialogDescription asChild>
                                 <div className="space-y-3">
                                   <div>
                                     Tem certeza que deseja remover o pedido <strong>"{request.requestTitle}"</strong> completamente do sistema?
                                   </div>
                                   <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                     <div className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                                       ⚠️ Importante
                                     </div>
                                     <div className="text-sm text-amber-700 dark:text-amber-300">
                                       Ao remover este pedido, ele será <strong>completamente excluído</strong> do sistema e não aparecerá mais no painel administrativo. 
                                       Se você deseja que este conteúdo seja adicionado ao catálogo, mantenha o pedido na lista.
                                     </div>
                                   </div>
                                 </div>
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancelar</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => handleRemoveRequest(request.requestId)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                               >
                                 Remover Pedido
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {request.addedToCategory && (
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Adicionado em:</span>
                        <Badge variant="outline">{request.addedToCategory}</Badge>
                      </div>
                    )}
                    
                    {request.addedObservation && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">Observação:</p>
                        <p className="text-sm text-muted-foreground">{request.addedObservation}</p>
                      </div>
                    )}
                    
                    {request.communicatedMessage && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                          Comunicado:
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {request.communicatedMessage}
                        </p>
                        {request.communicatedAt && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                            {formatDistanceToNow(new Date(request.communicatedAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {request.updatedAt && request.status !== 'Pendente' && (
                      <div className="text-xs text-muted-foreground">
                        Última atualização: {formatDistanceToNow(new Date(request.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
