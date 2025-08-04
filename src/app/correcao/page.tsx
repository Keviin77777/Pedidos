
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { M3UItem } from '@/lib/types';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { getM3UItems } from '@/lib/m3u';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { Button } from '@/components/ui/button';
import { CorrectionDialog } from '@/components/correction-dialog';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface EnrichedM3UItem extends M3UItem {
  status: 'loading' | 'loaded';
}

export default function CorrectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [m3uItems, setM3uItems] = useState<M3UItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EnrichedM3UItem[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchM3uData = async () => {
      setIsLoading(true);
      try {
        const items = await getM3UItems();
        setM3uItems(items);
      } catch (error) {
        console.error("Failed to load M3U list:", error);
        toast({
          title: 'Erro ao carregar lista local',
          description: 'Não foi possível carregar a lista de conteúdos existentes. Tente recarregar a página.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchM3uData();
  }, [toast]);

  const normalizeTitle = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
      .trim();
  };
  
  const searchTmdbForDetails = async (title: string): Promise<Partial<M3UItem>> => {
      try {
        const cleanedTitle = title.replace(/\s*\(\d{4}\)\s*$/, '').trim();
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          cleanedTitle
        )}&language=pt-BR`;
        const response = await fetch(searchUrl);
  
        if (!response.ok) return {};
  
        const data = await response.json();
        const result = data.results?.[0];

        if (result && (result.media_type === 'movie' || result.media_type === 'tv')) {
          return {
            synopsis: result.overview || 'Nenhuma sinopse disponível.',
            logo: result.poster_path ? `${TMDB_IMAGE_BASE_URL}${result.poster_path}` : null,
          };
        }
        return {};
      } catch (error) {
        console.error('Error fetching from TMDB for details:', error);
        return {};
      }
  };

  useEffect(() => {
    if (isLoading) return;

    const normalizedQuery = normalizeTitle(searchQuery);

    if (normalizedQuery.length < 3) {
      setFilteredItems([]);
      return;
    }

    const filtered = m3uItems.filter(item => 
      normalizeTitle(item.name).includes(normalizedQuery)
    );

    const enriched: EnrichedM3UItem[] = filtered.map(item => ({...item, status: 'loading'}));
    setFilteredItems(enriched);

    enriched.forEach(async (item, index) => {
        const details = await searchTmdbForDetails(item.name);
        setFilteredItems(prev => {
            const newItems = [...prev];
            if (newItems[index]) {
                newItems[index] = {
                    ...newItems[index],
                    ...details,
                    status: 'loaded',
                };
            }
            return newItems;
        });
    });

  }, [searchQuery, m3uItems, isLoading]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Corrigir um Conteúdo</h2>
            <p className="text-muted-foreground">Encontrou um problema? Busque o conteúdo e nos informe.</p>
          </div>
          <div className="flex flex-col w-full max-w-2xl mx-auto items-center space-y-2">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite o nome do filme ou série com problema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-6 rounded-full shadow-inner bg-card"
                disabled={isLoading}
              />
               {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
               )}
            </div>
          </div>

          <div className="pt-8">
            {searchQuery.length > 2 && filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredItems.map((item, index) => (
                   item.status === 'loading' ? (
                      <ContentCardSkeleton key={`skeleton-${index}`} />
                   ) : (
                     <div key={`result-${index}`} className="flex flex-col gap-2 items-center">
                       <ContentCard item={item} />
                       <CorrectionDialog item={item} />
                     </div>
                   )
                ))}
              </div>
            ) : (
               searchQuery.length > 2 && !isLoading && (
                <Card className="text-center py-10 px-6 border-dashed bg-card">
                  <CardContent>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      Nenhum resultado encontrado na sua lista
                    </h3>
                    <p className="text-muted-foreground">
                      Não encontramos nenhum conteúdo para "{searchQuery}" na sua lista M3U. Verifique o título ou se o item realmente existe.
                    </p>
                  </CardContent>
                </Card>
               )
            )}
          </div>
        </div>
      </div>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
