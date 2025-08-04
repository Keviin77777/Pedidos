import ContentGrid from '@/components/content-grid';
import Header from '@/components/header';
import { getM3UItems } from '@/lib/m3u';
import type { M3UItem } from '@/lib/types';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';

async function getSynopsis(title: string) {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      title
    )}&language=pt-BR`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return 'Não foi possível obter a sinopse.';
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      const synopsis = firstResult.overview || 'Nenhuma sinopse disponível.';
      return synopsis;
    }
    
    return 'Nenhuma sinopse disponível.';
  } catch (error) {
    console.error('Error fetching synopsis:', error);
    return 'Não foi possível obter a sinopse.';
  }
}

export default async function Home() {
  const items: M3UItem[] = await getM3UItems();

  const itemsWithSynopsis = await Promise.all(
    items.slice(0, 50).map(async (item) => {
      const synopsis = await getSynopsis(item.name);
      return { ...item, synopsis };
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ContentGrid allItems={itemsWithSynopsis} />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
