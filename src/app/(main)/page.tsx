
'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import type { M3UItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { ManualRequestDialog } from '@/components/request-dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { M3uContext } from '@/contexts/M3uContext';
import { saveContentRequest, onRequestsUpdated } from '@/lib/admin';
import type { ContentRequest } from '@/lib/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface SearchResult extends M3UItem {
  status: 'existing' | 'requestable' | 'loading' | 'requested';
  existingCategory?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('multi');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [requestedItems, setRequestedItems] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<ContentRequest[]>([]);

  const { m3uItems: m3uItemsCache, isLoading: isM3uLoading } = useContext(M3uContext);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onRequestsUpdated(
        (allRequests) => {
            setAddedItems(allRequests.filter(req => req.status === 'Adicionado'));
            const requestedTitles = new Set(allRequests.filter(r => r.status === 'Pendente').map(r => r.title));
            setRequestedItems(requestedTitles);
        },
        (error) => {
            console.error("Failed to listen for request updates:", error);
            toast({
                title: "Erro de Sincronização",
                description: "Não foi possível conectar para obter atualizações de pedidos.",
                variant: 'destructive'
            });
        }
    );
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const handleRequest = async (item: M3UItem) => {
    try {
      await saveContentRequest({
        title: item.name,
        type: item.category,
        logo: item.logo,
      });
      toast({
        title: 'Pedido Enviado!',
        description: `Recebemos seu pedido para "${item.name}".`,
      });
      // The onRequestsUpdated listener will handle the state update automatically
    } catch (error) {
       toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível enviar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const normalizeTitle = (title: string | null | undefined): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .split(':')[0] // Remove subtitles after a colon
      .replace(/\s*(s\d{2}e\d{2}|s\d{1,2}|t\d{1,2}e\d{1,2}).*$/i, '')
      .replace(/\s*\(\d{4}\)\s*$/, '') 
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/ & /g, ' e ') 
      .replace(/[^\w\s]/gi, '') 
      .replace(/\s+/g, ' ') 
      .trim();
  };
  
  const searchTmdb = async (query: string, type: string): Promise<M3UItem[]> => {
    try {
      const searchUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=pt-BR`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results
          .filter((res: any) => ((res.media_type === 'movie' || res.media_type === 'tv') || type === 'movie' || type === 'tv') && res.poster_path)
          .map((res: any) => ({
            name: res.title || res.name,
            synopsis: res.overview || 'Nenhuma sinopse disponível.',
            logo: res.poster_path ? `${TMDB_IMAGE_BASE_URL}${res.poster_path}` : null,
            category: res.media_type === 'tv' || type === 'tv' ? 'Série' : 'Filme',
            url: '',
          }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return [];
    }
  };

  const handleSearch = useCallback(async (query: string, type: string) => {
    if (isM3uLoading || query.trim().length < 3) {
      setResults([]);
      setSearchPerformed(false);
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);

    try {
      const tmdbResults = await searchTmdb(query, type);
      
      if (tmdbResults.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const normalizedM3uMap = new Map<string, M3UItem>();
      m3uItemsCache.forEach(item => {
        const normalizedName = normalizeTitle(item.name);
        if (!normalizedM3uMap.has(normalizedName)) {
            normalizedM3uMap.set(normalizedName, item);
        }
      });

      const processedResults = tmdbResults.map((tmdbItem): SearchResult => {
        const normalizedTmdbTitle = normalizeTitle(tmdbItem.name);
        const existingItem = normalizedM3uMap.get(normalizedTmdbTitle);
        
        // Use the live set of requested titles from our real-time listener
        const isRequested = requestedItems.has(tmdbItem.name);

        if (isRequested) {
            return {...tmdbItem, status: 'requested'};
        }
        if (existingItem) {
            return {...tmdbItem, status: 'existing', existingCategory: existingItem.category };
        }
        return {...tmdbItem, status: 'requestable'};
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
  }, [toast, requestedItems, m3uItemsCache, isM3uLoading]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery, searchType);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchType, handleSearch]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">Solicitar um Filme ou Série</h2>
            <p className="text-muted-foreground">Não encontrou o que procurava? Verifique aqui e faça seu pedido.</p>
          </div>
          <div className="flex flex-col w-full max-w-2xl mx-auto items-center space-y-4">
             <Tabs value={searchType} onValueChange={setSearchType}>
                <TabsList>
                    <TabsTrigger value="multi">Todos</TabsTrigger>
                    <TabsTrigger value="movie">Filmes</TabsTrigger>
                    <TabsTrigger value="tv">Séries</TabsTrigger>
                </TabsList>
             </Tabs>

            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Digite o nome d${searchType === 'tv' ? 'a série' : 'o filme'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-6 rounded-full shadow-inner bg-card"
                disabled={isM3uLoading}
              />
               {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
               )}
            </div>
            <ManualRequestDialog />
          </div>

          <div className="pt-8">
            {isLoading && !searchPerformed && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {Array.from({ length: 6 }).map((_, index) => (
                    <ContentCardSkeleton key={`skeleton-search-${index}`} />
                 ))}
              </div>
            )}
            
            {searchPerformed && (
              <>
                {results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {results.map((item, index) => (
                       item.status === 'loading' ? (
                          <ContentCardSkeleton key={`skeleton-${index}`} />
                       ) : (
                         <div key={`result-${index}`} className="flex flex-col gap-2 items-center">
                           <ContentCard item={item} showCategory={item.status !== 'existing'} />
                           {item.status === 'requestable' ? (
                              <Button 
                                 className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                                 onClick={() => handleRequest(item)}
                              >
                                 Solicitar
                              </Button>
                           ) : item.status === 'requested' ? (
                              <Button variant="outline" disabled className="w-full cursor-default">
                                  <Check className="mr-2 h-4 w-4" />
                                 Solicitado
                              </Button>
                           ) : (
                              <div className="text-center text-xs p-2 rounded-md bg-secondary text-secondary-foreground w-full cursor-default">
                                <p className="font-bold">Já está no sistema</p>
                                {item.existingCategory && <p className="truncate">em: {item.existingCategory}</p>}
                              </div>
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
          
          <div className="pt-16">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="added-items">
                <AccordionTrigger className="text-xl font-semibold text-primary hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <span>Pedidos Adicionados Recentemente</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6">
                  {addedItems.length > 0 ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                       {addedItems.map((item) => (
                         <div key={item.id} className="flex flex-col gap-2 items-center">
                            <ContentCard item={{
                                name: item.title,
                                logo: item.logo,
                                category: item.type,
                                url: '',
                                synopsis: `Pedido em: ${new Date(item.requestedAt).toLocaleDateString()}`
                            }} />
                             <div className="text-center text-xs p-2 rounded-md bg-secondary text-secondary-foreground w-full cursor-default">
                                <p className="font-bold">Adicionado!</p>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
