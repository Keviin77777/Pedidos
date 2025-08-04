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

interface TmdbDetails {
  synopsis: string;
  logo: string | null;
  name: string;
  category: string;
  url: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<M3UItem | null | 'not_found'>(null);
  const { toast } = useToast();

  const handleRequest = () => {
    if (searchResult && searchResult !== 'not_found') {
      console.log('Request submitted for:', searchResult.name);
      toast({
        title: 'Pedido Enviado!',
        description: `Recebemos seu pedido para "${searchResult.name}".`,
      });
      setSearchResult(null);
      setSearchQuery('');
    }
  };

  const getTmdbDetails = async (title: string): Promise<TmdbDetails | null> => {
    try {
      const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        title
      )}&language=pt-BR`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const synopsis = firstResult.overview || 'Nenhuma sinopse disponível.';
        const logo = firstResult.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${firstResult.poster_path}`
          : null;
        
        return { 
          synopsis, 
          logo,
          name: firstResult.title || firstResult.name,
          category: firstResult.media_type === 'tv' ? 'Série' : 'Filme',
          url: '',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return null;
    }
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
    setSearchResult(null);

    const allItems = await getM3UItems();
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    const existingItem = allItems.find(item => item.name.toLowerCase().includes(lowerCaseQuery));

    if (existingItem) {
      toast({
        title: 'Conteúdo já existe!',
        description: `"${existingItem.name}" já está em nosso catálogo.`,
      });
      setSearchResult(null);
    } else {
      const tmdbData = await getTmdbDetails(searchQuery);
      if (tmdbData) {
        setSearchResult(tmdbData);
      } else {
        setSearchResult('not_found');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Solicitar um Filme ou Série</h2>
            <p className="text-muted-foreground">Não encontrou o que procurava? Verifique aqui e faça seu pedido.</p>
          </div>
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-grow">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite o nome do filme ou série..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

            {searchResult === 'not_found' && (
              <Card className="text-center py-10 px-6 border-dashed">
                 <CardContent>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Conteúdo não encontrado no TMDB
                  </h3>
                  <p className="text-muted-foreground">
                    Não conseguimos encontrar detalhes para "{searchQuery}". Por favor, verifique o título e tente novamente.
                  </p>
                 </CardContent>
              </Card>
            )}

            {searchResult && searchResult !== 'not_found' && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-xs">
                   <ContentCard item={searchResult} />
                </div>
                <div className='text-center space-y-2'>
                   <h3 className="text-xl font-semibold">Pronto para solicitar?</h3>
                   <p className="text-muted-foreground">
                     Encontramos as informações abaixo. Clique em solicitar para fazer o pedido.
                   </p>
                </div>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full" onClick={handleRequest}>
                  Solicitar "{searchResult.name}"
                </Button>
              </div>
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
