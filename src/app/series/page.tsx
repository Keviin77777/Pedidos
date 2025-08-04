
'use client';

import { useState, useEffect } from 'react';
import type { M3UItem } from '@/lib/types';
import Header from '@/components/header';
import ContentCard from '@/components/content-card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { useToast } from '@/hooks/use-toast';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const fetchPopularSeries = async (): Promise<M3UItem[]> => {
  try {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch popular series');
    }
    const data = await response.json();
    return data.results.map((series: any) => ({
      name: series.name,
      logo: series.poster_path ? `${TMDB_IMAGE_BASE_URL}${series.poster_path}` : null,
      category: 'Série',
      synopsis: series.overview,
      url: '', 
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function SeriesPage() {
  const [series, setSeries] = useState<M3UItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true);
      const popularSeries = await fetchPopularSeries();
      if (popularSeries.length === 0) {
        toast({
          title: 'Erro ao buscar séries',
          description: 'Não foi possível carregar a lista de séries populares.',
          variant: 'destructive',
        });
      }
      setSeries(popularSeries);
      setIsLoading(false);
    };

    loadSeries();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Séries Populares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {isLoading
              ? Array.from({ length: 18 }).map((_, index) => <ContentCardSkeleton key={index} />)
              : series.map((item, index) => <ContentCard key={index} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
