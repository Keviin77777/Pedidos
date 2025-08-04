
'use client';

import { useState, useEffect } from 'react';
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
  getContentRequests,
  getProblemReports,
  updateContentRequestStatus,
  updateProblemReportStatus
} from '@/lib/admin';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ContentRequest {
  id: string;
  title: string;
  type: string;
  notes?: string;
  requestedAt: string;
  status: 'Pendente' | 'Adicionado';
}

interface ProblemReport {
  id: string;
  title: string;
  problem: string;
  reportedAt: string;
  status: 'Aberto' | 'Resolvido';
}


export default function AdminDashboard() {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  
  // Use effect to load data on the client side
  useEffect(() => {
    setRequests(getContentRequests());
    setReports(getProblemReports());
  }, []);

  const handleRequestStatusChange = (id: string, status: 'Pendente' | 'Adicionado') => {
    updateContentRequestStatus(id, status);
    setRequests(getContentRequests()); // Refresh state
  };
  
  const handleReportStatusChange = (id: string, status: 'Aberto' | 'Resolvido') => {
    updateProblemReportStatus(id, status);
    setReports(getProblemReports()); // Refresh state
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden md:table-cell">Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                            <div className="font-medium">{req.title}</div>
                            {req.notes && <div className="hidden text-sm text-muted-foreground md:inline">Obs: {req.notes}</div>}
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título do Conteúdo</TableHead>
                      <TableHead>Problema Descrito</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
