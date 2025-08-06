'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import type { M3UItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Shield, Tv, LogOut } from 'lucide-react';
import ContentCard from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { ManualRequestDialog } from '@/components/manual-request-dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { M3uContext } from '@/contexts/M3uContext';
import { onRequestsUpdated } from '@/lib/admin';
import type { ContentRequest } from '@/lib/admin';
import { RequestWithNotesDialog } from '@/components/request-with-notes-dialog';
import { XtreamProvider, useXtream } from '@/contexts/XtreamContext';
import { Label } from '@/components/ui/label';


const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface SearchResult extends M3UItem {
  status: 'existing' | 'requestable' | 'loading' | 'requested';
  existingCategory?: string;
}

// Componente principal dos pedidos
function PedidosContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('multi');
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [requestedItems, setRequestedItems] = useState<Set<string>>(new Set());

  const { m3uItems: m3uItemsCache, isInitialLoading: isM3uLoading } = useContext(M3uContext);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onRequestsUpdated(
        (allRequests) => {
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

  const normalizeTitle = (title: string | null | undefined): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/\s*(s\d{2}e\d{2}|s\d{1,2}|t\d{1,2}e\d{1,2}).*$/i, '') // Remove episode info
      .replace(/\s*\(\d{4}\)\s*$/, '') // Remove year at the end
      .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove any brackets content at the end
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/ & /g, ' e ') 
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, ' ') 
      .trim();
  };

  // Função precisa para comparação de títulos
  const isExactMatch = (tmdbTitle: string, m3uTitle: string): boolean => {
    // Comparação direta dos títulos originais (case-insensitive)
    if (tmdbTitle.toLowerCase() === m3uTitle.toLowerCase()) {
      return true;
    }
    
    // Normalizar títulos para comparação
    const normalizedTmdb = normalizeTitle(tmdbTitle);
    const normalizedM3u = normalizeTitle(m3uTitle);
    
    // Se os títulos normalizados são idênticos
    if (normalizedTmdb === normalizedM3u) {
      return true;
    }
    
    // Verificar se um título contém palavras que indicam que são filmes diferentes
    const tmdbLower = tmdbTitle.toLowerCase();
    const m3uLower = m3uTitle.toLowerCase();
    
    // Mapeamento de números romanos para números arábicos
    const romanToArabic = (str: string): string => {
      const romanNumerals: { [key: string]: number } = {
        'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
      };
      
      // Procurar por números romanos no final do título
      const words = str.split(' ');
      const lastWord = words[words.length - 1];
      
      if (romanNumerals[lastWord]) {
        words[words.length - 1] = romanNumerals[lastWord].toString();
        return words.join(' ');
      }
      
      // Procurar por números romanos em qualquer posição
      for (let i = 0; i < words.length; i++) {
        if (romanNumerals[words[i]]) {
          words[i] = romanNumerals[words[i]].toString();
        }
      }
      
      return words.join(' ');
    };
    
    // Aplicar conversão de números romanos
    const tmdbWithArabic = romanToArabic(tmdbLower);
    const m3uWithArabic = romanToArabic(m3uLower);
    
    // Comparar após conversão de números romanos
    if (tmdbWithArabic === m3uWithArabic) {
      return true;
    }
    
    // Verificar se um título tem número e o outro não
    const tmdbHasNumber = /\d/.test(tmdbLower);
    const m3uHasNumber = /\d/.test(m3uLower);
    
    if (tmdbHasNumber !== m3uHasNumber) {
      // Se um tem número e o outro não, extrair o nome base
      const tmdbBase = tmdbLower.replace(/\s+\d+.*$/, '');
      const m3uBase = m3uLower.replace(/\s+\d+.*$/, '');
      
      if (tmdbBase === m3uBase) {
        return true;
      }
    }
    
    // Comparação mais flexível para Rambo
    if (tmdbLower.includes('rambo') && m3uLower.includes('rambo')) {
      // Extrair apenas "rambo" de ambos
      const tmdbRambo = tmdbLower.replace(/rambo.*/, 'rambo').trim();
      const m3uRambo = m3uLower.replace(/rambo.*/, 'rambo').trim();
      
      if (tmdbRambo === m3uRambo) {
        return true;
      }
    }
    
    // Se um contém ":" e o outro não, são filmes diferentes
    if ((tmdbLower.includes(':') && !m3uLower.includes(':')) || 
        (!tmdbLower.includes(':') && m3uLower.includes(':'))) {
      return false;
    }
    
    // Se ambos têm ":" mas os subtítulos são diferentes, são filmes diferentes
    if (tmdbLower.includes(':') && m3uLower.includes(':')) {
      const tmdbSubtitle = tmdbLower.split(':')[1]?.trim();
      const m3uSubtitle = m3uLower.split(':')[1]?.trim();
      if (tmdbSubtitle && m3uSubtitle && tmdbSubtitle !== m3uSubtitle) {
        return false;
      }
    }
    
    // Se um contém "parte" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('parte') && !m3uLower.includes('parte')) || 
        (!tmdbLower.includes('parte') && m3uLower.includes('parte'))) {
      return false;
    }
    
    // Se um contém "edição" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('edição') && !m3uLower.includes('edição')) || 
        (!tmdbLower.includes('edição') && m3uLower.includes('edição'))) {
      return false;
    }
    
    // Se um contém "especial" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('especial') && !m3uLower.includes('especial')) || 
        (!tmdbLower.includes('especial') && m3uLower.includes('especial'))) {
      return false;
    }
    
    // Se um contém "documentário" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('documentário') && !m3uLower.includes('documentário')) || 
        (!tmdbLower.includes('documentário') && m3uLower.includes('documentário'))) {
      return false;
    }
    
    // Se um contém "lenda" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('lenda') && !m3uLower.includes('lenda')) || 
        (!tmdbLower.includes('lenda') && m3uLower.includes('lenda'))) {
      return false;
    }
    
    // Se um contém "último" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('último') && !m3uLower.includes('último')) || 
        (!tmdbLower.includes('último') && m3uLower.includes('último'))) {
      return false;
    }
    
    // Se um contém "caminho" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('caminho') && !m3uLower.includes('caminho')) || 
        (!tmdbLower.includes('caminho') && m3uLower.includes('caminho'))) {
      return false;
    }
    
    // Se um contém "busca" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('busca') && !m3uLower.includes('busca')) || 
        (!tmdbLower.includes('busca') && m3uLower.includes('busca'))) {
      return false;
    }
    
    // Se um contém "criando" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('criando') && !m3uLower.includes('criando')) || 
        (!tmdbLower.includes('criando') && m3uLower.includes('criando'))) {
      return false;
    }
    
    // Se um contém "cavaleiro" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('cavaleiro') && !m3uLower.includes('cavaleiro')) || 
        (!tmdbLower.includes('cavaleiro') && m3uLower.includes('cavaleiro'))) {
      return false;
    }
    
    // Se um contém "mestre" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('mestre') && !m3uLower.includes('mestre')) || 
        (!tmdbLower.includes('mestre') && m3uLower.includes('mestre'))) {
      return false;
    }
    
    // Se um contém "fogo" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('fogo') && !m3uLower.includes('fogo')) || 
        (!tmdbLower.includes('fogo') && m3uLower.includes('fogo'))) {
      return false;
    }
    
    // Se um contém "cinzas" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('cinzas') && !m3uLower.includes('cinzas')) || 
        (!tmdbLower.includes('cinzas') && m3uLower.includes('cinzas'))) {
      return false;
    }
    
    // Se um contém "água" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('água') && !m3uLower.includes('água')) || 
        (!tmdbLower.includes('água') && m3uLower.includes('água'))) {
      return false;
    }
    
    // Se um contém "glória" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('glória') && !m3uLower.includes('glória')) || 
        (!tmdbLower.includes('glória') && m3uLower.includes('glória'))) {
      return false;
    }
    
    // Se um contém "mund" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('mund') && !m3uLower.includes('mund')) || 
        (!tmdbLower.includes('mund') && m3uLower.includes('mund'))) {
      return false;
    }
    
    // Se um contém "pandora" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('pandora') && !m3uLower.includes('pandora')) || 
        (!tmdbLower.includes('pandora') && m3uLower.includes('pandora'))) {
      return false;
    }
    
    // Se um contém "tulkun" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('tulkun') && !m3uLower.includes('tulkun')) || 
        (!tmdbLower.includes('tulkun') && m3uLower.includes('tulkun'))) {
      return false;
    }
    
    // Se um contém "eywa" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('eywa') && !m3uLower.includes('eywa')) || 
        (!tmdbLower.includes('eywa') && m3uLower.includes('eywa'))) {
      return false;
    }
    
    // Se um contém "mergulho" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('mergulho') && !m3uLower.includes('mergulho')) || 
        (!tmdbLower.includes('mergulho') && m3uLower.includes('mergulho'))) {
      return false;
    }
    
    // Se um contém "profundo" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('profundo') && !m3uLower.includes('profundo')) || 
        (!tmdbLower.includes('profundo') && m3uLower.includes('profundo'))) {
      return false;
    }
    
    // Se um contém "dragao" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('dragao') && !m3uLower.includes('dragao')) || 
        (!tmdbLower.includes('dragao') && m3uLower.includes('dragao'))) {
      return false;
    }
    
    // Se um contém "treinar" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('treinar') && !m3uLower.includes('treinar')) || 
        (!tmdbLower.includes('treinar') && m3uLower.includes('treinar'))) {
      return false;
    }
    
    // Se um contém "seu" e o outro não, são filmes diferentes
    if ((tmdbLower.includes('seu') && !m3uLower.includes('seu')) || 
        (!tmdbLower.includes('seu') && m3uLower.includes('seu'))) {
      return false;
    }
    
    // Se um contém números e o outro não, são filmes diferentes
    const tmdbHasNumbers = /\d/.test(tmdbLower);
    const m3uHasNumbers = /\d/.test(m3uLower);
    if (tmdbHasNumbers !== m3uHasNumbers) {
      return false;
    }
    
    // Se ambos têm números, verificar se são os mesmos números
    if (tmdbHasNumbers && m3uHasNumbers) {
      const tmdbNumbers = tmdbLower.match(/\d+/g) || [];
      const m3uNumbers = m3uLower.match(/\d+/g) || [];
      if (tmdbNumbers.length > 0 && m3uNumbers.length > 0) {
        const tmdbNumberStr = tmdbNumbers.join('');
        const m3uNumberStr = m3uNumbers.join('');
        if (tmdbNumberStr !== m3uNumberStr) {
          return false;
        }
      }
    }
    
    // Verificar se são títulos muito similares (apenas para casos muito específicos)
    const tmdbWords = normalizedTmdb.split(' ').filter(word => word.length > 2);
    const m3uWords = normalizedM3u.split(' ').filter(word => word.length > 2);
    
    // Apenas aceitar se ambos títulos têm exatamente a mesma palavra principal
    // E a diferença de comprimento for muito pequena (máximo 3 caracteres)
    if (tmdbWords[0] === m3uWords[0] && tmdbWords.length >= 1 && m3uWords.length >= 1) {
      const lengthDiff = Math.abs(normalizedTmdb.length - normalizedM3u.length);
      // Aceitar apenas se a diferença for muito pequena (máximo 3 caracteres)
      if (lengthDiff <= 3) {
        // Verificação adicional: se um título tem palavras significativamente diferentes do outro
        const tmdbUniqueWords = tmdbWords.filter(word => !m3uWords.includes(word));
        const m3uUniqueWords = m3uWords.filter(word => !tmdbWords.includes(word));
        
        // Se há muitas palavras únicas em cada título, provavelmente são filmes diferentes
        if (tmdbUniqueWords.length > 1 || m3uUniqueWords.length > 1) {
          return false;
        }
        
        // Verificação final: se um título tem mais de 2 palavras e o outro tem apenas 1,
        // provavelmente são filmes diferentes
        if ((tmdbWords.length > 2 && m3uWords.length === 1) || 
            (m3uWords.length > 2 && tmdbWords.length === 1)) {
          return false;
        }
        
        // Verificação adicional: se os títulos têm palavras em comum mas são muito diferentes
        const commonWords = tmdbWords.filter(word => m3uWords.includes(word));
        const totalWords = Math.max(tmdbWords.length, m3uWords.length);
        const similarityRatio = commonWords.length / totalWords;
        
        // Se a similaridade for menor que 80%, são filmes diferentes
        if (similarityRatio < 0.8) {
          return false;
        }
        
        return true;
      }
    }
    
    return false;
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

      const processedResults = tmdbResults.map((tmdbItem): SearchResult => {
        // Use the live set of requested titles from our real-time listener
        const isRequested = requestedItems.has(tmdbItem.name);

        if (isRequested) {
            return {...tmdbItem, status: 'requested'};
        }
        
        // Buscar por correspondência exata no cache M3U
        let existingItems: M3UItem[] = [];
        
        // Debug: verificar se há itens no cache
        if (m3uItemsCache.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('CACHE M3U VAZIO - nenhum item carregado');
          }
        }
        
        for (const m3uItem of m3uItemsCache) {
          if (isExactMatch(tmdbItem.name, m3uItem.name)) {
            existingItems.push(m3uItem);
            if (process.env.NODE_ENV === 'development') {
              console.log('MATCH ENCONTRADO:', {
                tmdb: tmdbItem.name,
                m3u: m3uItem.name,
                normalizedTmdb: normalizeTitle(tmdbItem.name),
                normalizedM3u: normalizeTitle(m3uItem.name),
                category: m3uItem.category,
                tmdbWords: normalizeTitle(tmdbItem.name).split(' ').filter(word => word.length > 2),
                m3uWords: normalizeTitle(m3uItem.name).split(' ').filter(word => word.length > 2)
              });
            }
          }
        }
        
        // Debug: se não encontrou match, mostrar alguns exemplos do cache
        if (existingItems.length === 0 && m3uItemsCache.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('NENHUM MATCH para:', tmdbItem.name);
            console.log('Primeiros 5 itens do cache M3U:', m3uItemsCache.slice(0, 5).map(item => item.name));
          }
        }
        
        if (existingItems.length > 0) {
            // Usar a primeira categoria encontrada (ou a mais relevante)
            const firstCategory = existingItems[0].category;
            return {...tmdbItem, status: 'existing', existingCategory: firstCategory };
        }
        return {...tmdbItem, status: 'requestable'};
      });

      setResults(processedResults);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error during search:", error);
      }
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
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                 {Array.from({ length: 6 }).map((_, index) => (
                    <ContentCardSkeleton key={`skeleton-search-${index}`} />
                 ))}
              </div>
            )}
            
            {searchPerformed && !isLoading && (
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
                             <RequestWithNotesDialog item={item}>
                               <Button className="w-full">
                                  Solicitar
                               </Button>
                             </RequestWithNotesDialog>
                           ) : item.status === 'requested' ? (
                              <Button variant="outline" disabled className="w-full cursor-default">
                                  <Check className="mr-2 h-4 w-4" />
                                 Solicitado
                              </Button>
                           ) : (
                              <div className="text-center text-xs p-2 rounded-md bg-secondary text-secondary-foreground w-full cursor-default">
                                <p className="font-bold">Já está no sistema</p>
                                {item.existingCategory && (
                                  <p className="truncate">
                                    em: <span className="text-green-500 font-semibold">{item.existingCategory}</span>
                                  </p>
                                )}
                              </div>
                           )}
                         </div>
                       )
                    ))}
                  </div>
                ) : (
                   searchQuery.length > 2 && (
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
      </div>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Pedidos Cine &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return <PedidosContent />;
}