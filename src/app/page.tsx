
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { M3UItem } from '@/lib/types';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { getM3UItems } from '@/lib/m3u';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { ManualRequestDialog } from '@/components/request-dialog';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface SearchResult extends M3UItem {
  status: 'existing' | 'requestable' | 'loading';
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [m3uItemsCache, setM3uItemsCache] = useState<M3UItem[]>([]);
  const [isCacheLoading, setIsCacheLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchM3uData = async () => {
      try {
        const items = await getM3UItems();
        setM3uItemsCache(items);
      } catch (error) {
        console.error("Failed to load M3U cache:", error);
        toast({
          title: 'Erro ao carregar lista local',
          description: 'Não foi possível carregar a lista de conteúdos existentes. A busca pode não ser precisa.',
          variant: 'destructive',
        });
      } finally {
        setIsCacheLoading(false);
      }
    };
    fetchM3uData();
  }, [toast]);


  const handleRequest = (item: M3UItem) => {
    console.log('Request submitted for:', item.name);
    toast({
      title: 'Pedido Enviado!',
      description: `Recebemos seu pedido para "${item.name}".`,
    });
  };

  const normalizeTitle = (title: string | null | undefined): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/\s*\(\d{4}\)\s*$/, '') // Remove (year) only from the end
      .normalize('NFD') // Decompose accents
      .replace(/[\u0300-\u036f]/g, '') // Remove accent characters
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .trim();
  };
  
  const searchTmdb = async (title: string): Promise<M3UItem[]> => {
    try {
      const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        title
      )}&language=pt-BR`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results
          .filter((res: any) => (res.media_type === 'movie' || res.media_type === 'tv') && res.poster_path)
          .map((res: any) => ({
            name: res.title || res.name,
            synopsis: res.overview || 'Nenhuma sinopse disponível.',
            logo: res.poster_path ? `${TMDB_IMAGE_BASE_URL}${res.poster_path}` : null,
            category: res.media_type === 'tv' ? 'Série' : 'Filme',
            url: '',
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return [];
    }
  };


  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setResults([]);
      setSearchPerformed(false);
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);

    try {
      const tmdbResults = await searchTmdb(query);
      
      if (tmdbResults.length === 0) {
        setResults([]);
        setSearchPerformed(true);
        setIsLoading(false);
        return;
      }

      const initialResults: SearchResult[] = tmdbResults.map(item => ({...item, status: 'loading'}));
      setResults(initialResults);
      setIsLoading(false);

      const normalizedM3uTitles = new Set(m3uItemsCache.map(item => normalizeTitle(item.name)));

      const processedResults = tmdbResults.map((tmdbItem): SearchResult => {
        const normalizedTmdbTitle = normalizeTitle(tmdbItem.name);
        
        const isExisting = normalizedM3uTitles.has(normalizedTmdbTitle);
        
        return {
          ...tmdbItem,
          status: isExisting ? 'existing' : 'requestable',
        };
      });

      setResults(processedResults);

    } catch (error) {
      console.error("Error during search:", error);
      toast({
        title: 'Erro na Busca',
        description: 'Ocorreu um erro ao buscar. Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
        setIsLoading(false);
    }
  }, [toast, m3uItemsCache]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Solicitar um Filme ou Série</h2>
            <p className="text-muted-foreground">Não encontrou o que procurava? Verifique aqui e faça seu pedido.</p>
          </div>
          <div className="flex flex-col w-full max-w-2xl mx-auto items-center space-y-2">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite o nome do filme ou série..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-6 rounded-full shadow-inner bg-card"
                disabled={isCacheLoading}
              />
               {isCacheLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
               )}
            </div>
            <ManualRequestDialog />
          </div>

          <div className="pt-8">
            {isLoading && !searchPerformed && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {searchPerformed && (
              <>
                {results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {results.map((item, index) => (
                       item.status === 'loading' ? (
                          <ContentCardSkeleton key={`skeleton-${index}`} />
                       ) : (
                         <div key={`result-${index}`} className="flex flex-col gap-2 items-center">
                           <ContentCard item={item} />
                           {item.status === 'requestable' ? (
                              <Button 
                                 className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                                 onClick={() => handleRequest(item)}
                              >
                                 Solicitar
                              </Button>
                           ) : (
                              <Button variant="secondary" disabled className="w-full cursor-default">
                                 Já está no sistema
                              </Button>
                           )}
                         </div>
                       )
                    ))}
                  </div>
                ) : (
                   searchQuery.length > 2 && !isLoading && (
                    <Card className="text-center py-10 px-6 border-dashed bg-card">
                      <CardContent>
                        <h3 className="text-xl font-semibold text-card-foreground mb-2">
                          Nenhum resultado encontrado
                        </h3>
                        <p className="text-muted-foreground">
                          Não encontramos nenhum conteúdo para "{searchQuery}". Verifique o título ou faça um pedido manual.
                        </p>
                      </CardContent>
                    </Card>
                   )
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
