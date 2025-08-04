
'use client';

import { useState } from 'react';
import type { M3UItem } from '@/lib/types';
import { getM3UItems } from '@/lib/m3u';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface SearchResult extends M3UItem {
  status: 'existing' | 'requestable' | 'not_found';
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const { toast } = useToast();

  const handleRequest = (item: M3UItem) => {
    console.log('Request submitted for:', item.name);
    toast({
      title: 'Pedido Enviado!',
      description: `Recebemos seu pedido para "${item.name}".`,
    });
  };

  const normalizeTitle = (title: string) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/\s*\(\d{4}\)\s*/, '') // Remove (year)
      .normalize('NFD') // Decompose accents
      .replace(/[\u0300-\u036f]/g, '') // Remove accent characters
      .trim();
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      toast({
        title: 'Busca inválida',
        description: 'Por favor, digite um título para buscar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSearchPerformed(false);
    setResults([]);

    try {
      // 1. Fetch from TMDB first
      const tmdbResults = await searchTmdb(searchQuery);

      if (tmdbResults.length === 0) {
        setSearchPerformed(true);
        setIsLoading(false);
        return;
      }
      
      // 2. Fetch M3U items, but don't let it crash the app
      let m3uItems: M3UItem[] = [];
      try {
        m3uItems = await getM3UItems();
      } catch (e) {
        console.error("Could not fetch M3U list, continuing without it.", e);
        // m3uItems will be an empty array, so all TMDB results will be 'requestable'
      }

      const normalizedM3uTitles = new Set(m3uItems.map(item => normalizeTitle(item.name)));

      // 3. Process results: check if TMDB results exist in M3U
      const processedResults = tmdbResults.map((tmdbItem): SearchResult => {
        const normalizedTmdbTitle = normalizeTitle(tmdbItem.name);
        
        // Check if any M3U title is included in the TMDB title or vice-versa, for better matching
        const isExisting = Array.from(normalizedM3uTitles).some(m3uTitle => 
            normalizedTmdbTitle.includes(m3uTitle) || m3uTitle.includes(normalizedTmdbTitle)
        );

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
        description: 'Ocorreu um erro ao buscar no TMDB. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setSearchPerformed(true);
    }
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


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Solicitar um Filme ou Série</h2>
            <p className="text-muted-foreground">Não encontrou o que procurava? Verifique aqui e faça seu pedido.</p>
          </div>
          <div className="flex w-full max-w-2xl mx-auto items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite o nome do filme ou série..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-10 text-lg py-6 rounded-full shadow-inner"
              />
            </div>
            <Button size="lg" className="rounded-full" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          <div className="pt-8">
            {isLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {searchPerformed && !isLoading && (
              <>
                {results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {results.map((item, index) => (
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
                    ))}
                  </div>
                ) : (
                   <Card className="text-center py-10 px-6 border-dashed">
                    <CardContent>
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-muted-foreground">
                        Não encontramos nenhum conteúdo para "{searchQuery}". Verifique o título e tente novamente.
                      </p>
                    </CardContent>
                  </Card>
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
