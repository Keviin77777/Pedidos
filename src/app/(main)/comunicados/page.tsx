'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import LoadingOverlay from '@/components/loading-overlay';
import { onRequestsUpdated } from '@/lib/admin';
import type { ContentRequest } from '@/lib/admin';

export default function ComunicadosPage() {
  const [communicatedItems, setCommunicatedItems] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onRequestsUpdated(
      (allRequests) => {
        setCommunicatedItems(allRequests.filter((req) => req.status === 'Comunicado'));
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar comunicados:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Comunicados de Conteúdo
        </h1>
        <p className="text-muted-foreground">
          Aqui você encontra os comunicados sobre pedidos que não puderam ser atendidos no momento.
        </p>
      </div>

      {communicatedItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Nenhum comunicado por aqui!
              </h3>
              <p className="text-muted-foreground">
                Quando houver comunicados sobre seus pedidos, eles aparecerão nesta seção.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
                 <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {communicatedItems.map((item) => (
                         <Card key={item.id} className="overflow-hidden">
               <CardHeader className="pb-2 px-3 pt-3">
                 <div className="flex items-start justify-between">
                   <div className="flex-1 min-w-0">
                     <CardTitle className="text-sm font-semibold truncate">
                       {item.title}
                     </CardTitle>
                     <CardDescription className="text-xs">
                       {item.type} • {new Date(item.requestedAt).toLocaleDateString('pt-BR')}
                     </CardDescription>
                   </div>
                   <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs px-2 py-1">
                     Comunicado
                   </Badge>
                 </div>
               </CardHeader>
                             <CardContent className="pt-0 px-3 pb-3">
                                   <div className="mb-3">
                    <div className="aspect-[2/3] relative mb-3">
                      <img
                        src={item.logo || 'https://placehold.co/300x450.png'}
                        alt={`Cover for ${item.title}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                                 {item.communicatedMessage && (
                   <div className="mt-3 p-2 bg-orange-500/10 rounded-lg border border-orange-200">
                     <div className="flex items-start gap-2">
                       <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                       <div className="flex-1">
                         <p className="text-xs font-medium text-orange-700 mb-1">
                           Comunicado:
                         </p>
                         <p className="text-xs text-orange-600 leading-relaxed">
                           {item.communicatedMessage}
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
                                 {item.notes && (
                   <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                     <span className="font-medium">Observação original:</span> {item.notes}
                   </div>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 