
'use server';

import type { M3UItem } from './types';

// The server URL and credentials are now securely accessed from environment variables
const API_URL = process.env.XUI_API_URL;
const USERNAME = process.env.XUI_USERNAME;
const PASSWORD = process.env.XUI_PASSWORD;

interface XuiOneContent {
  name: string;
  stream_icon?: string;
  category_id?: string;
  // series_id is specific to series endpoint
  series_id?: number;
}

interface XuiOneCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}


// This function fetches all VOD and Series content from the XUI One API
export async function getM3UItems(): Promise<M3UItem[]> {
  if (!API_URL || !USERNAME || !PASSWORD) {
    console.error('XUI One API URL or credentials are not configured in environment variables.');
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
      fetch(endpoints.vod, { cache: 'no-store' }), // Cache for 10 minutes
      fetch(endpoints.series, { cache: 'no-store' }),
      fetch(endpoints.vodCategories, { cache: 'no-store' }),
      fetch(endpoints.seriesCategories, { cache: 'no-store' })
    ]);

    // Helper to process response and parse JSON
    const processResponse = async (response: Response, name: string) => {
        if (!response.ok) {
            console.error(`Failed to fetch ${name} from XUI One API:`, response.statusText);
            return [];
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error(`${name} API did not return an array.`);
            return [];
        }
        return data;
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

    // Process VOD items
    const movieItems: M3UItem[] = vodData.map((item: XuiOneContent) => {
      const categoryName = item.category_id ? vodCategoryMap.get(item.category_id) : 'Filme';
      return {
        name: item.name,
        logo: item.stream_icon || null,
        category: categoryName || 'Filme',
        url: '', // Not needed for checking existence
        synopsis: '', // To be fetched from TMDB
      };
    });

    // Process Series items
    const seriesItems: M3UItem[] = seriesData.map((item: XuiOneContent) => {
      const categoryName = item.category_id ? seriesCategoryMap.get(item.category_id) : 'Série';
      return {
        name: item.name,
        logo: item.stream_icon || null,
        category: categoryName || 'Série',
        url: '',
        synopsis: '',
      };
    });
    
    // Combine both lists and return
    const allItems = [...movieItems, ...seriesItems];
      
    return allItems;

  } catch (error) {
    console.error('Error fetching or parsing data from XUI One API:', error);
    return [];
  }
}
