
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
  deleteContentRequest,
  deleteProblemReport,
  onProblemReportsUpdated,
  onRequestsUpdated,
  updateContentRequestStatus,
  updateProblemReportStatus
} from '@/lib/admin';
import type { ContentRequest, ProblemReport } from '@/lib/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkAsAddedDialog } from './mark-as-added-dialog';
import { MarkAsCommunicatedDialog } from './mark-as-communicated-dialog';
import { EditObservationDialog } from './edit-observation-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { AdminSettingsDialog } from './admin-settings-dialog';


export default function AdminDashboard() {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeRequests = onRequestsUpdated(
      (updatedRequests) => {
        setRequests(updatedRequests);
        setLoadingRequests(false);
      },
      (error) => {
        console.error("Failed to listen for request updates:", error);
        toast({ title: 'Erro ao Carregar Pedidos', description: 'Não foi possível carregar as solicitações.', variant: 'destructive' });
        setLoadingRequests(false);
      }
    );

    const unsubscribeReports = onProblemReportsUpdated(
      (updatedReports) => {
        setReports(updatedReports);
        setLoadingReports(false);
      },
      (error) => {
        console.error("Failed to listen for report updates:", error);
        toast({ title: 'Erro ao Carregar Relatórios', description: 'Não foi possível carregar os relatórios.', variant: 'destructive' });
        setLoadingReports(false);
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeRequests();
      unsubscribeReports();
    };
  }, [toast]);

  const handleSetToPending = async (id: string) => {
    try {
      await updateContentRequestStatus(id, 'Pendente');
      toast({ title: 'Status Alterado', description: 'O pedido foi marcado como Pendente.' });
    } catch(e) {
      toast({ title: 'Erro ao Alterar Status', description: 'Não foi possível alterar o status do pedido.', variant: 'destructive' });
    }
  };

  const handleReportStatusChange = async (id: string, status: 'Aberto' | 'Resolvido') => {
    try {
      await updateProblemReportStatus(id, status);
      toast({ title: 'Status Alterado', description: `O relatório foi marcado como ${status.toLowerCase()}.` });
    } catch(e) {
      toast({ title: 'Erro ao Alterar Status', description: 'Não foi possível alterar o status do relatório.', variant: 'destructive' });
    }
  };

  const handleRequestDelete = async (id: string) => {
    try {
      await deleteContentRequest(id);
      toast({ title: 'Pedido Removido', description: 'O pedido foi removido com sucesso.' });
    } catch (e) {
      toast({ title: 'Erro ao Remover', description: 'Não foi possível remover o pedido.', variant: 'destructive' });
    }
  };

  const handleReportDelete = async (id: string) => {
    try {
      await deleteProblemReport(id);
      toast({ title: 'Relatório Removido', description: 'O relatório foi removido com sucesso.' });
    } catch (e) {
      toast({ title: 'Erro ao Remover', description: 'Não foi possível remover o relatório.', variant: 'destructive' });
    }
  };

  const renderTableBody = (
    data: any[],
    loading: boolean,
    columns: React.ReactNode,
    renderRow: (item: any, index: number) => React.ReactNode,
    emptyMessage: string
  ) => {
    return (
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>{columns}</TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map(renderRow)
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto min-h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between">
          <div className="grid gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
            <p className="text-muted-foreground">
              Gerencie as solicitações de novos conteúdos e os relatórios de problemas.
            </p>
          </div>
          <AdminSettingsDialog />
        </div>
        <Tabs defaultValue="requests" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="requests">Solicitações de Conteúdo</TabsTrigger>
            <TabsTrigger value="reports">Relatórios de Problemas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle>Solicitações de Conteúdo</CardTitle>
                <CardDescription>
                  Pedidos de novos filmes e séries feitos pelos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {renderTableBody(
                  requests,
                  loadingRequests,
                  <>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden lg:table-cell">Usuário</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </>,
                  (req: ContentRequest) => (
                    <TableRow key={req.id} className="h-48">
                                             <TableCell>
                                                       <div className="flex items-center gap-6 py-3">
                               <div className="w-24 h-36 relative flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                 <Image
                                     src={req.logo || 'https://placehold.co/400x600.png'}
                                     alt={`Capa de ${req.title}`}
                                     fill
                                     className="object-cover"
                                     sizes="96px"
                                     data-ai-hint="movie poster"
                                 />
                               </div>
                                                               <div className="flex-1">
                                  <div className="font-bold text-lg mb-2">{req.title}</div>
                                  {req.notes && <div className="text-sm text-muted-foreground mb-1">Obs: {req.notes}</div>}
                                  {req.status === 'Adicionado' && req.addedToCategory && (
                                    <div className="text-xs text-primary/80">Adicionado em: {req.addedToCategory}</div>
                                  )}
                                  {req.status === 'Comunicado' && req.communicatedMessage && (
                                    <div className="text-xs text-orange-500/80">Comunicado: {req.communicatedMessage}</div>
                                  )}
                                </div>
                           </div>
                       </TableCell>
                                                                     <TableCell className="hidden md:table-cell">
                                                     <div className="text-base font-semibold py-3">{req.type}</div>
                         </TableCell>
                         <TableCell className="hidden lg:table-cell">
                           <div className="py-3">
                            {req.username ? (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-base">{req.username}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                                                     <div className="text-base py-3">
                             {new Date(req.requestedAt).toLocaleDateString("pt-BR", {
                               day: '2-digit', month: '2-digit', year: 'numeric'
                             })}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="py-3">
                                                      <Badge 
                            variant={
                              req.status === 'Pendente' ? 'destructive' : 
                              req.status === 'Adicionado' ? 'default' : 
                              req.status === 'Comunicado' ? 'secondary' : 'secondary'
                            }
                            className="text-sm px-3 py-1"
                          >
                            {req.status}
                          </Badge>
                          </div>
                        </TableCell>
                       <TableCell className="text-right">
                         <div className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <MarkAsAddedDialog requestId={req.id} requestTitle={req.title}>
                                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                  Marcar como Adicionado
                                </div>
                              </MarkAsAddedDialog>
                              <MarkAsCommunicatedDialog requestId={req.id} requestTitle={req.title}>
                                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                  Comunicado
                                </div>
                              </MarkAsCommunicatedDialog>
                              {req.status === 'Adicionado' && (
                                <EditObservationDialog requestId={req.id} requestTitle={req.title} currentObservation={req.addedObservation}>
                                  <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    Editar Observação
                                  </div>
                                </EditObservationDialog>
                              )}
                              {req.status !== 'Pendente' && (
                                <DropdownMenuItem onClick={() => handleSetToPending(req.id)}>
                                  Marcar como Pendente
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-destructive/10 focus:text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    Remover Pedido
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso removerá permanentemente o pedido de
                                        "{req.title}" do banco de dados.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRequestDelete(req.id)}>
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                  "Nenhuma solicitação de conteúdo encontrada."
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="flex-1 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle>Relatórios de Problemas</CardTitle>
                <CardDescription>
                  Problemas em conteúdos existentes reportados pelos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                 {renderTableBody(
                  reports,
                  loadingReports,
                  <>
                    <TableHead>Título do Conteúdo</TableHead>
                    <TableHead>Problema Descrito</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </>,
                  (report: ProblemReport) => (
                    <TableRow key={report.id} className="h-48">
                                             <TableCell>
                                                       <div className="flex items-center gap-6 py-3">
                                <div className="w-24 h-36 relative flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                  <Image
                                      src={report.logo || 'https://placehold.co/400x600.png'}
                                      alt={`Capa de ${report.title}`}
                                      fill
                                      className="object-cover"
                                      sizes="96px"
                                      data-ai-hint="movie poster"
                                  />
                                </div>
                                <div className="font-bold text-lg">{report.title}</div>
                            </div>
                       </TableCell>
                                               <TableCell>
                                                     <div className="text-base max-w-md py-3">{report.problem}</div>
                         </TableCell>
                         <TableCell className="hidden md:table-cell">
                             <div className="text-base py-3">
                              {new Date(report.reportedAt).toLocaleDateString("pt-BR", {
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                            </div>
                        </TableCell>
                          <TableCell>
                                                         <div className="py-3">
                               <Badge 
                               variant={report.status === 'Aberto' ? 'destructive' : 'secondary'}
                               className="text-sm px-3 py-1"
                             >
                               {report.status}
                               </Badge>
                             </div>
                         </TableCell>
                         <TableCell className="text-right">
                           <div className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleReportStatusChange(report.id, 'Resolvido')}>
                                Marcar como Resolvido
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReportStatusChange(report.id, 'Aberto')}>
                                Marcar como Aberto
                              </DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-destructive focus:bg-destructive/10 focus:text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    Remover Relatório
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso removerá permanentemente o relatório de problema para
                                        "{report.title}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleReportDelete(report.id)}>
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                  "Nenhum relatório de problema encontrado."
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
