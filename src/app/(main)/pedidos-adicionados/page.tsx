
'use client';

import { useState, useEffect } from 'react';
import { onRequestsUpdated } from '@/lib/admin';
import type { ContentRequest } from '@/lib/admin';
import ContentCard from '@/components/content-card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AddedItemsPage() {
  const [addedItems, setAddedItems] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onRequestsUpdated(
      (allRequests) => {
        const addedRequests = allRequests.filter((req) => req.status === 'Adicionado');
        
        // Ordenar por updatedAt (quando foi adicionado) ou requestedAt como fallback
        const sortedAddedRequests = addedRequests.sort((a, b) => {
          const aDate = a.updatedAt ? new Date(a.updatedAt) : new Date(a.requestedAt);
          const bDate = b.updatedAt ? new Date(b.updatedAt) : new Date(b.requestedAt);
          return bDate.getTime() - aDate.getTime(); // Mais recente primeiro
        });
        
        setAddedItems(sortedAddedRequests);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to listen for request updates:', error);
        toast({
          title: 'Erro de Sincronização',
          description: 'Não foi possível carregar os pedidos adicionados.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
             <Sparkles className="w-8 h-8 text-primary" />
             <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  Pedidos Adicionados Recentemente
                </h2>
                <p className="text-muted-foreground">
                    Confira aqui os últimos filmes e séries que foram adicionados ao catálogo.
                </p>
             </div>
          </div>
          
          <div className="pt-8">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <ContentCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : addedItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {addedItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 items-center">
                    <ContentCard
                      item={{
                        name: item.title,
                        logo: item.logo || null,
                        category: item.type,
                        url: '',
                        synopsis: `Pedido em: ${new Date(item.requestedAt).toLocaleDateString()}`,
                      }}
                    />
                    <div className="text-center text-xs p-2 rounded-md bg-secondary text-secondary-foreground w-full cursor-default">
                      <p className="font-bold">Adicionado!</p>
                      {item.addedToCategory && (
                        <p className="truncate">Em: {item.addedToCategory}</p>
                      )}
                      {item.addedObservation && (
                        <div className="mt-1 p-1 bg-primary/10 rounded text-primary text-xs">
                          <p className="font-semibold">Observação:</p>
                          <p className="break-words">{item.addedObservation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-10 px-6 border-dashed bg-card">
                <CardContent>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Nenhuma novidade por aqui... ainda!
                  </h3>
                  <p className="text-muted-foreground">
                    Assim que seus pedidos forem atendidos, eles aparecerão nesta seção.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
       <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Pedidos Cine &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
