'use server';

import { fetchTmdbSynopsis } from '@/ai/flows/fetch-tmdb-synopsis';

export async function getSynopsis(title: string) {
  try {
    const result = await fetchTmdbSynopsis({ title });
    if (result.found) {
      return result.synopsis;
    }
    return 'No synopsis available.';
  } catch (error) {
    console.error('Error fetching synopsis:', error);
    return 'Could not retrieve synopsis.';
  }
}
