'use server';
/**
 * @fileOverview Fetches a movie/series synopsis from TMDB based on the title.
 *
 * - fetchTmdbSynopsis - A function that fetches the synopsis of a movie/series from TMDB.
 * - FetchTmdbSynopsisInput - The input type for the fetchTmdbSynopsis function.
 * - FetchTmdbSynopsisOutput - The return type for the fetchTmdbSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchTmdbSynopsisInputSchema = z.object({
  title: z.string().describe('The title of the movie or series.'),
});
export type FetchTmdbSynopsisInput = z.infer<typeof FetchTmdbSynopsisInputSchema>;

const FetchTmdbSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('A brief synopsis of the movie or series.'),
  found: z.boolean().describe('Whether or not the synopsis was found.'),
});
export type FetchTmdbSynopsisOutput = z.infer<typeof FetchTmdbSynopsisOutputSchema>;

export async function fetchTmdbSynopsis(input: FetchTmdbSynopsisInput): Promise<FetchTmdbSynopsisOutput> {
  return fetchTmdbSynopsisFlow(input);
}

const apiKey = '279e039eafd4ccc7c289a589c9b613e3';

const fetchSynopsisTool = ai.defineTool({
  name: 'fetchSynopsis',
  description: 'Fetches a movie or series synopsis from TMDB.',
  inputSchema: z.object({
    title: z.string().describe('The title of the movie or series.'),
  }),
  outputSchema: z.object({
    synopsis: z.string().describe('A brief synopsis of the movie or series.'),
    found: z.boolean().describe('Whether or not the synopsis was found.'),
  }),
}, async (input) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(input.title)}`
    );

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return { synopsis: 'Failed to fetch synopsis from TMDB.', found: false };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      const synopsis = firstResult.overview || 'No synopsis available.';
      return { synopsis: synopsis, found: true };
    } else {
      return { synopsis: 'Synopsis not found on TMDB.', found: false };
    }
  } catch (error) {
    console.error('Error fetching synopsis from TMDB:', error);
    return { synopsis: 'Error fetching synopsis.', found: false };
  }
});

const fetchTmdbSynopsisFlow = ai.defineFlow(
  {
    name: 'fetchTmdbSynopsisFlow',
    inputSchema: FetchTmdbSynopsisInputSchema,
    outputSchema: FetchTmdbSynopsisOutputSchema,
  },
  async (input) => {
    return await fetchSynopsisTool(input);
  }
);
