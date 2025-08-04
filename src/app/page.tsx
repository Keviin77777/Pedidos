import ContentGrid from '@/components/content-grid';
import Header from '@/components/header';
import { getM3UItems } from '@/lib/m3u';
import type { M3UItem } from '@/lib/types';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TmdbDetails {
  synopsis: string;
  logo: string | null;
}

async function getTmdbDetails(title: string): Promise<TmdbDetails> {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      title
    )}&language=pt-BR`;
    const response = await fetch(searchUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return { synopsis: 'Não foi possível obter a sinopse.', logo: null };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      const synopsis = firstResult.overview || 'Nenhuma sinopse disponível.';
      const logo = firstResult.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${firstResult.poster_path}`
        : null;
      return { synopsis, logo };
    }
    
    return { synopsis: 'Nenhuma sinopse disponível.', logo: null };
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    return { synopsis: 'Não foi possível obter a sinopse.', logo: null };
  }
}

export default async function Home() {
  const items: M3UItem[] = await getM3UItems();

  const itemsWithTmdbData = await Promise.all(
    items.slice(0, 50).map(async (item) => {
      const { synopsis, logo } = await getTmdbDetails(item.name);
      return { ...item, synopsis, logo }; 
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ContentGrid allItems={itemsWithTmdbData} />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
