
'use client';

import { useState, useEffect } from 'react';
import type { M3UItem } from '@/lib/types';
import Header from '@/components/header';
import ContentCard from '@/components/content-card';
import ContentCardSkeleton from '@/components/content-card-skeleton';
import { useToast } from '@/hooks/use-toast';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const fetchPopularMovies = async (): Promise<M3UItem[]> => {
  try {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    const data = await response.json();
    return data.results.map((movie: any) => ({
      name: movie.title,
      logo: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      category: 'Filme',
      synopsis: movie.overview,
      url: '', 
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<M3UItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      const popularMovies = await fetchPopularMovies();
      if (popularMovies.length === 0) {
        toast({
          title: 'Erro ao buscar filmes',
          description: 'Não foi possível carregar a lista de filmes populares.',
          variant: 'destructive',
        });
      }
      setMovies(popularMovies);
      setIsLoading(false);
    };

    loadMovies();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Filmes Populares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {isLoading
              ? Array.from({ length: 18 }).map((_, index) => <ContentCardSkeleton key={index} />)
              : movies.map((movie, index) => <ContentCard key={index} item={movie} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
