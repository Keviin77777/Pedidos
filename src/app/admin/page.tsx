
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
import Header from "@/components/header";

// Mock data - replace with actual data from your backend/DB
const contentRequests = [
  {
    id: "REQ001",
    title: "O Poderoso Chefão: Parte II (1974)",
    type: "Filme",
    requestedAt: "2024-08-01T10:00:00Z",
    status: "Pendente",
  },
  {
    id: "REQ002",
    title: "Breaking Bad - Temporada 5",
    type: "Série",
    requestedAt: "2024-08-01T11:30:00Z",
    status: "Pendente",
  },
  {
    id: "REQ003",
    title: "Clube da Luta (1999)",
    type: "Filme",
    requestedAt: "2024-07-31T15:00:00Z",
    status: "Adicionado",
  },
   {
    id: "REQ004",
    title: "Interestelar (2014) - Versão IMAX",
    type: "Pedido Manual",
    notes: "Gostaria da versão com a proporção de tela expandida.",
    requestedAt: "2024-07-30T09:12:00Z",
    status: "Pendente",
  },
];

const problemReports = [
  {
    id: "REP001",
    title: "Game of Thrones - S08E03",
    problem: "A imagem está muito escura, quase não dá pra ver nada.",
    reportedAt: "2024-07-29T22:00:00Z",
    status: "Aberto",
  },
  {
    id: "REP002",
    title: "Pulp Fiction",
    problem: "O áudio está dessincronizado a partir dos 45 minutos.",
    reportedAt: "2024-07-28T18:45:00Z",
    status: "Resolvido",
  },
  {
    id: "REP003",
    title: "Vingadores: Ultimato",
    problem: "O poster do filme está com a imagem errada, é do filme Guerra Infinita.",
    reportedAt: "2024-07-27T14:20:00Z",
    status: "Aberto",
  },
];

export default function AdminDashboard() {
  return (
    <>
      <Header />
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentRequests.map((req) => (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problemReports.map((report) => (
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
