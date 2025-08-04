
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
  onProblemReportsUpdated,
  onRequestsUpdated,
  updateContentRequestStatus,
  updateProblemReportStatus
} from '@/lib/admin';
import type { ContentRequest, ProblemReport } from '@/lib/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleRequestStatusChange = async (id: string, status: 'Pendente' | 'Adicionado') => {
    await updateContentRequestStatus(id, status);
  };

  const handleReportStatusChange = async (id: string, status: 'Aberto' | 'Resolvido') => {
    await updateProblemReportStatus(id, status);
  };

  const handleRequestDelete = async (id: string) => {
    await deleteContentRequest(id);
    toast({ title: 'Pedido Removido', description: 'O pedido foi removido com sucesso.' });
  }

  const renderTableBody = (
    data: any[],
    loading: boolean,
    columns: React.ReactNode,
    renderRow: (item: any, index: number) => React.ReactNode,
    emptyMessage: string
  ) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>{columns}</TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map(renderRow)
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de novos conteúdos e os relatórios de problemas.
          </p>
        </div>
        <Tabs defaultValue="requests">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="requests">Solicitações de Conteúdo</TabsTrigger>
            <TabsTrigger value="reports">Relatórios de Problemas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Conteúdo</CardTitle>
                <CardDescription>
                  Pedidos de novos filmes e séries feitos pelos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTableBody(
                  requests,
                  loadingRequests,
                  <>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </>,
                  (req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                          <div className="flex items-center gap-4">
                              <div className="w-24 h-14 relative flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                <Image
                                    src={req.logo || 'https://placehold.co/150x100.png'}
                                    alt={`Capa de ${req.title}`}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                    data-ai-hint="movie poster"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{req.title}</div>
                                {req.notes && <div className="text-sm text-muted-foreground">Obs: {req.notes}</div>}
                              </div>
                          </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{req.type}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(req.requestedAt).toLocaleDateString("pt-BR", {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={req.status === 'Pendente' ? 'destructive' : 'secondary'}
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRequestStatusChange(req.id, 'Adicionado')}>
                                Marcar como Adicionado
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRequestStatusChange(req.id, 'Pendente')}>
                                Marcar como Pendente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleRequestDelete(req.id)}
                              >
                                Remover Pedido
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ),
                  "Nenhuma solicitação de conteúdo encontrada."
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Problemas</CardTitle>
                <CardDescription>
                  Problemas em conteúdos existentes reportados pelos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  (report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.problem}</TableCell>
                      <TableCell className="hidden md:table-cell">
                          {new Date(report.reportedAt).toLocaleDateString("pt-BR", {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </TableCell>
                        <TableCell>
                          <Badge 
                          variant={report.status === 'Aberto' ? 'destructive' : 'secondary'}
                        >
                          {report.status}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </>
  );
}
