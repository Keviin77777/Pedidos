'use server';

const TMDB_API_KEY = '279e039eafd4ccc7c289a589c9b613e3';

export async function getSynopsis(title: string) {
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
