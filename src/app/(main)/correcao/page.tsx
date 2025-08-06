
'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import type { M3UItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { Card, CardContent } from '@/components/ui/card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { CorrectionDialog } from '@/components/correction-dialog';
import { M3uContext } from '@/contexts/M3uContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface EnrichedM3UItem extends M3UItem {
  status: 'loading' | 'loaded';
}

export default function CorrectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState<EnrichedM3UItem[]>([]);
  const { m3uItems: m3uItemsCache, isInitialLoading: isCacheLoading } = useContext(M3uContext);


  const normalizeTitle = (title: string): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
      .trim();
  };
  
  const searchTmdbForDetails = async (item: M3UItem): Promise<M3UItem> => {
    try {
        const cleanedTitle = item.name
          .replace(/\s*\[.*?\]\s*/g, '') // Remove content in brackets like [L]
          .replace(/\s*\(\d{4}\)\s*$/, '')
          .trim();
        
        // Adjust search type based on item, but default to both if 'all' is selected
        const searchTypes = searchType === 'movie' ? ['movie'] : searchType === 'series' ? ['tv'] : ['movie', 'tv'];

        const requests = searchTypes.map(type => 
            fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanedTitle)}&language=pt-BR`)
                .then(res => res.ok ? res.json() : Promise.resolve({ results: [] }))
        );

        const results = await Promise.all(requests);
        const allResults = results.flatMap((result, index) => 
            (result.results || []).map((r: any) => ({ ...r, searchType: searchTypes[index] }))
        );

        const normalizedCleanedTitle = normalizeTitle(cleanedTitle);
        const bestResult = allResults.sort((a, b) => {
            const titleA = normalizeTitle(a.title || a.name || '');
            const titleB = normalizeTitle(b.title || b.name || '');
            const scoreA = titleA === normalizedCleanedTitle ? 3 : titleA.startsWith(normalizedCleanedTitle) ? 2 : titleA.includes(normalizedCleanedTitle) ? 1 : 0;
            const scoreB = titleB === normalizedCleanedTitle ? 3 : titleB.startsWith(normalizedCleanedTitle) ? 2 : titleB.includes(normalizedCleanedTitle) ? 1 : 0;
            
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            // Give preference to exact match on type if scores are equal
            if(item.type === 'series' && b.searchType === 'tv') return 1;
            if(item.type === 'series' && a.searchType === 'tv') return -1;
            if(item.type === 'movie' && b.searchType === 'movie') return 1;
            if(item.type === 'movie' && a.searchType === 'movie') return -1;

            return (b.popularity || 0) - (a.popularity || 0);

        })[0];
        
        if (bestResult) {
            return {
                ...item,
                synopsis: bestResult.overview || 'Nenhuma sinopse disponível.',
                logo: bestResult.poster_path ? `${TMDB_IMAGE_BASE_URL}${bestResult.poster_path}` : item.logo,
                category: bestResult.searchType === 'tv' ? 'Série' : 'Filme',
            };
        }

        return item;
    } catch (error) {
        console.error('Error fetching from TMDB for details:', error);
        return item;
    }
  };


  const performSearch = useCallback(async (query: string, type: string) => {
    if (isCacheLoading || query.trim().length < 3) {
      setFilteredItems([]);
      return;
    }
    
    setIsLoading(true);
    const normalizedQuery = normalizeTitle(query);

    const sourceList = m3uItemsCache.filter(item => {
        if (type === 'all') return true;
        // The type in m3uItem is 'movie' or 'series'
        // The type from the tab is 'movie' or 'series'
        return item.type === type;
    });

    const filtered = sourceList.filter(item => 
      normalizeTitle(item.name).includes(normalizedQuery)
    );

    const enriched: EnrichedM3UItem[] = filtered.map(item => ({...item, status: 'loading'}));
    setFilteredItems(enriched);
    setIsLoading(false);

    enriched.forEach(async (item) => {
        try {
            // Pass the specific item to the search function
            const details = await searchTmdbForDetails(item);
            setFilteredItems(prev => {
                const newItems = [...prev];
                const originalIndex = newItems.findIndex(i => i.name === item.name && i.status === 'loading');

                if (originalIndex !== -1) {
                    newItems[originalIndex] = {
                        ...details,
                        status: 'loaded',
                    };
                }
                return newItems.sort((a,b) => a.name.localeCompare(b.name));
            });
        } catch (error) {
             setFilteredItems(prev => {
                const newItems = [...prev];
                const originalIndex = newItems.findIndex(i => i.name === item.name && i.status === 'loading');
                if (originalIndex !== -1) {
                    newItems[originalIndex] = { ...item, status: 'loaded' };
                }
                return newItems.sort((a,b) => a.name.localeCompare(b.name));
            });
        }
    });

  }, [m3uItemsCache, isCacheLoading]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchQuery, searchType);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchType, performSearch]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">Corrigir um Conteúdo</h2>
            <p className="text-muted-foreground">Encontrou um problema? Busque o conteúdo e nos informe.</p>
          </div>
          <div className="flex flex-col w-full max-w-2xl mx-auto items-center space-y-4">
            <Tabs value={searchType} onValueChange={setSearchType}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="movie">Filmes</TabsTrigger>
                    <TabsTrigger value="series">Séries</TabsTrigger>
                </TabsList>
             </Tabs>
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Digite o nome d${searchType === 'series' ? 'a série' : 'o filme'} para corrigir...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 text-lg py-6 rounded-full shadow-inner bg-card"
                disabled={isCacheLoading}
              />
               {(isLoading || isCacheLoading) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
               )}
            </div>
          </div>

          <div className="pt-8">
            {searchQuery.length > 2 && filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
        <p>Pedidos Cine &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
