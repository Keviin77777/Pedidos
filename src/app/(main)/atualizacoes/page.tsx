'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Film, Tv } from 'lucide-react';
import { getM3UItems } from '@/lib/m3u';
import type { M3UItem } from '@/lib/types';
import { ContentDetailsDialog } from '@/components/content-details-dialog';

export default function AtualizacoesPage() {
  const [movies, setMovies] = useState<M3UItem[]>([]);
  const [series, setSeries] = useState<M3UItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para o modal de detalhes
  const [selectedItem, setSelectedItem] = useState<M3UItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const allItems = await getM3UItems();
        
        // Separar filmes e séries
        const movieItems = allItems.filter(item => item.type === 'movie');
        const seriesItems = allItems.filter(item => item.type === 'series');
        
        // Pegar os últimos 30 de cada (invertendo a ordem)
        const lastMovies = movieItems.slice(-30).reverse();
        const lastSeries = seriesItems.slice(-30).reverse();
        
        setMovies(lastMovies);
        setSeries(lastSeries);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleCardClick = (item: M3UItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const ContentCard = ({ item }: { item: M3UItem }) => (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105"
      onClick={() => handleCardClick(item)}
    >
      <CardHeader className="p-0">
        <div className="aspect-[2/3] relative">
          <img
            src={item.logo || 'https://placehold.co/400x600.png'}
            alt={`Capa de ${item.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/400x600.png';
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
            {item.name}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
            {item.category}
          </Badge>
        </div>
        {item.synopsis && (
          <CardDescription className="text-xs text-muted-foreground line-clamp-3">
            {item.synopsis}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando atualizações...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <RefreshCw className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Atualizações de Conteúdo
            </h1>
            <p className="text-muted-foreground">
              Confira os últimos filmes e séries adicionados ao catálogo.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="movies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movies" className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            Filmes ({movies.length})
          </TabsTrigger>
          <TabsTrigger value="series" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Séries ({series.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-6">
          {movies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Nenhum filme encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Não há filmes disponíveis no momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {movies.map((movie) => (
                <ContentCard key={`${movie.name}-${movie.category}`} item={movie} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="series" className="mt-6">
          {series.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Nenhuma série encontrada
                  </h3>
                  <p className="text-muted-foreground">
                    Não há séries disponíveis no momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {series.map((serie) => (
                <ContentCard key={`${serie.name}-${serie.category}`} item={serie} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal de Detalhes */}
      <ContentDetailsDialog
        item={selectedItem}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
} 