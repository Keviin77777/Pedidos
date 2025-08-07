
'use server';

import type { M3UItem } from './types';

// TMDB API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Function to search TMDB for content
async function searchTmdbContent(name: string, type: 'movie' | 'tv'): Promise<{ poster_path?: string; overview?: string } | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    // Clean the name for TMDB search (remove (L), (DUB), etc.)
    const cleanName = name.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Try different search variations
    const searchVariations = [
      cleanName,
      cleanName.replace(/^\d+\s*/, ''), // Remove leading numbers
      cleanName.replace(/\s*\([^)]*\)/g, '').trim(), // Remove all parentheses
      cleanName.split(' ').slice(0, 3).join(' ') // First 3 words
    ];
    
    for (const searchTerm of searchVariations) {
      if (!searchTerm.trim()) continue;
      
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=pt-BR`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        return {
          poster_path: firstResult.poster_path,
          overview: firstResult.overview
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// The server URL and credentials are now securely accessed from environment variables
const API_URL = process.env.XUI_API_URL || 'https://dnscine.top';
const USERNAME = process.env.XUI_USERNAME || 'Vodsm3u789DS';
const PASSWORD = process.env.XUI_PASSWORD || 'w5NwV8dPXE';

interface XuiOneContent {
  name: string;
  stream_icon?: string;
  category_id?: string;
  vod_id?: number; // ID para filmes
  series_id?: number; // ID para séries
  cover?: string; // Campo cover para séries
  stream_id?: number; // Possível ID alternativo
  num?: number; // Outro possível ID
  id?: number; // ID genérico
}

interface XuiOneCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

// This function fetches all VOD and Series content from the XUI One API
export async function getM3UItems(): Promise<M3UItem[]> {
  if (!API_URL || !USERNAME || !PASSWORD) {
    return [];
  }

  try {
    const baseUrl = `${API_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}`;
    
    // Define all API endpoints to be called
    const endpoints = {
      vod: `${baseUrl}&action=get_vod_streams`,
      series: `${baseUrl}&action=get_series`,
      vodCategories: `${baseUrl}&action=get_vod_categories`,
      seriesCategories: `${baseUrl}&action=get_series_categories`,
    };

    // Fetch all data in parallel for maximum efficiency
    const [
      vodResponse, 
      seriesResponse, 
      vodCategoriesResponse, 
      seriesCategoriesResponse
    ] = await Promise.all([
      fetch(endpoints.vod, { cache: 'no-store' }),
      fetch(endpoints.series, { cache: 'no-store' }),
      fetch(endpoints.vodCategories, { cache: 'no-store' }),
      fetch(endpoints.seriesCategories, { cache: 'no-store' })
    ]);

    // Helper to process response and parse JSON
    const processResponse = async (response: Response, name: string) => {
      if (!response.ok) {
        return [];
      }
      try {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data;
      } catch (error) {
         return [];
      }
    };

    const vodData: XuiOneContent[] = await processResponse(vodResponse, 'VOD streams');
    const seriesData: XuiOneContent[] = await processResponse(seriesResponse, 'Series');
    const vodCategoryData: XuiOneCategory[] = await processResponse(vodCategoriesResponse, 'VOD categories');
    const seriesCategoryData: XuiOneCategory[] = await processResponse(seriesCategoriesResponse, 'Series categories');
    
    // Para exibição: pegar apenas as 30 últimas de cada categoria
    const recentVodData = vodData.slice(-30);
    const recentSeriesData = seriesData.slice(-30);

    // Create maps for quick category lookup
    const vodCategoryMap = new Map<string, string>();
    vodCategoryData.forEach(cat => vodCategoryMap.set(cat.category_id, cat.category_name));
    
    const seriesCategoryMap = new Map<string, string>();
    seriesCategoryData.forEach(cat => seriesCategoryMap.set(cat.category_id, cat.category_name));

    // Process VOD items with TMDB data
    const movieItems: M3UItem[] = await Promise.all(
      recentVodData.map(async (item: XuiOneContent) => {
        const categoryName = item.category_id ? vodCategoryMap.get(item.category_id) : 'Filme';
        
        // Search TMDB for movie data
        const tmdbData = await searchTmdbContent(item.name, 'movie');
        
        return {
          name: item.name,
          logo: tmdbData?.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}` : item.stream_icon || null,
          category: categoryName || 'Filme',
          url: '', // Not needed for checking existence
          synopsis: tmdbData?.overview || '',
          type: 'movie',
          vod_id: item.stream_id || item.vod_id || item.num || item.id,
        };
      })
    );

    // Process Series items with IPTV cover data
    const seriesItems: M3UItem[] = await Promise.all(
      recentSeriesData.map(async (item: XuiOneContent) => {
        const categoryName = item.category_id ? seriesCategoryMap.get(item.category_id) : 'Série';
        
        // Use cover from IPTV API directly, fallback to TMDB if no cover
        let logo = item.cover || item.stream_icon || null;
        let synopsis = '';
        
        // Only search TMDB if no cover from IPTV
        if (!item.cover) {
          const tmdbData = await searchTmdbContent(item.name, 'tv');
          logo = tmdbData?.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}` : item.stream_icon || null;
          synopsis = tmdbData?.overview || '';
        }
        
        return {
          name: item.name,
          logo: logo,
          category: categoryName || 'Série',
          url: '',
          synopsis: synopsis,
          type: 'series',
          series_id: item.stream_id || item.series_id || item.num || item.id,
        };
      })
    );
    
    // Combine both lists and return
    const allItems = [...movieItems, ...seriesItems];
    
    return allItems;

  } catch (error) {
    // Error fetching or parsing data from XUI One API
    return [];
  }
}

// Função para retornar todos os dados para comparação
export async function getAllM3UItems(): Promise<M3UItem[]> {
  if (!API_URL || !USERNAME || !PASSWORD) {
    return [];
  }

  try {
    const baseUrl = `${API_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}`;
    
    // Define all API endpoints to be called
    const endpoints = {
      vod: `${baseUrl}&action=get_vod_streams`,
      series: `${baseUrl}&action=get_series`,
      vodCategories: `${baseUrl}&action=get_vod_categories`,
      seriesCategories: `${baseUrl}&action=get_series_categories`,
    };

    // Fetch all data in parallel for maximum efficiency
    const [
      vodResponse, 
      seriesResponse, 
      vodCategoriesResponse, 
      seriesCategoriesResponse
    ] = await Promise.all([
      fetch(endpoints.vod, { cache: 'no-store' }),
      fetch(endpoints.series, { cache: 'no-store' }),
      fetch(endpoints.vodCategories, { cache: 'no-store' }),
      fetch(endpoints.seriesCategories, { cache: 'no-store' })
    ]);

    // Helper to process response and parse JSON
    const processResponse = async (response: Response, name: string) => {
      if (!response.ok) {
        return [];
      }
      try {
        const data = await response.json();
        if (!Array.isArray(data)) {
          return [];
        }
        return data;
      } catch (error) {
         return [];
      }
    };

    const vodData: XuiOneContent[] = await processResponse(vodResponse, 'VOD streams');
    const seriesData: XuiOneContent[] = await processResponse(seriesResponse, 'Series');
    const vodCategoryData: XuiOneCategory[] = await processResponse(vodCategoriesResponse, 'VOD categories');
    const seriesCategoryData: XuiOneCategory[] = await processResponse(seriesCategoriesResponse, 'Series categories');
    
    // Create maps for quick category lookup
    const vodCategoryMap = new Map<string, string>();
    vodCategoryData.forEach(cat => vodCategoryMap.set(cat.category_id, cat.category_name));
    
    const seriesCategoryMap = new Map<string, string>();
    seriesCategoryData.forEach(cat => seriesCategoryMap.set(cat.category_id, cat.category_name));

    // Process VOD items with TMDB data
    const movieItems: M3UItem[] = await Promise.all(
      vodData.map(async (item: XuiOneContent) => {
        const categoryName = item.category_id ? vodCategoryMap.get(item.category_id) : 'Filme';
        
        // Search TMDB for movie data
        const tmdbData = await searchTmdbContent(item.name, 'movie');
        
        return {
          name: item.name,
          logo: tmdbData?.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}` : item.stream_icon || null,
          category: categoryName || 'Filme',
          url: '', // Not needed for checking existence
          synopsis: tmdbData?.overview || '',
          type: 'movie',
          vod_id: item.stream_id || item.vod_id || item.num || item.id,
        };
      })
    );

    // Process Series items with IPTV cover data
    const seriesItems: M3UItem[] = await Promise.all(
      seriesData.map(async (item: XuiOneContent) => {
        const categoryName = item.category_id ? seriesCategoryMap.get(item.category_id) : 'Série';
        
        // Use cover from IPTV API directly, fallback to TMDB if no cover
        let logo = item.cover || item.stream_icon || null;
        let synopsis = '';
        
        // Only search TMDB if no cover from IPTV
        if (!item.cover) {
          const tmdbData = await searchTmdbContent(item.name, 'tv');
          logo = tmdbData?.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}` : item.stream_icon || null;
          synopsis = tmdbData?.overview || '';
        }
        
        return {
          name: item.name,
          logo: logo,
          category: categoryName || 'Série',
          url: '',
          synopsis: synopsis,
          type: 'series',
          series_id: item.stream_id || item.series_id || item.num || item.id,
        };
      })
    );
    
    // Combine both lists and return
    const allItems = [...movieItems, ...seriesItems];
    
    return allItems;
  } catch (error) {
    // Error fetching or parsing data from XUI One API
    return [];
  }
}
