
'use server';

import type { M3UItem } from './types';

// The server URL and credentials are now securely accessed from environment variables
const API_URL = process.env.XUI_API_URL;
const USERNAME = process.env.XUI_USERNAME;
const PASSWORD = process.env.XUI_PASSWORD;

interface XuiOneVodInfo {
  name: string;
  stream_icon?: string;
  category_id?: string;
  // Other properties from the API can be added here if needed
}

interface XuiOneCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}


// This function fetches all VOD content (movies and series) from the XUI One API
export async function getM3UItems(): Promise<M3UItem[]> {
  if (!API_URL || !USERNAME || !PASSWORD) {
    console.error('XUI One API URL or credentials are not configured in environment variables.');
    return [];
  }

  try {
    // Construct the API URL for fetching VOD streams
    const apiUrl = `${API_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_vod_streams`;
    
    // Fetch categories in parallel to map category IDs to names
    const categoriesUrl = `${API_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_vod_categories`;
    
    const [vodResponse, categoriesResponse] = await Promise.all([
      fetch(apiUrl, { next: { revalidate: 600 } }), // Cache for 10 minutes
      fetch(categoriesUrl, { next: { revalidate: 600 } })
    ]);


    if (!vodResponse.ok) {
      console.error('Failed to fetch VOD streams from XUI One API:', vodResponse.statusText);
      return [];
    }
     if (!categoriesResponse.ok) {
      console.error('Failed to fetch categories from XUI One API:', categoriesResponse.statusText);
      return [];
    }

    const vodData: XuiOneVodInfo[] | { user_info?: any, server_info?: any } = await vodResponse.json();
    const categoryData: XuiOneCategory[] = await categoriesResponse.json();

    if (!Array.isArray(vodData)) {
      console.error("VOD API did not return an array. It might have returned an auth object instead.");
      return [];
    }
     if (!Array.isArray(categoryData)) {
      console.error("Categories API did not return an array.");
      return [];
    }

    // Create a map for quick category lookup
    const categoryMap = new Map<string, string>();
    categoryData.forEach(cat => {
      categoryMap.set(cat.category_id, cat.category_name);
    });
    
    // Filter out any items that are not movies or series, if necessary
    // This example assumes all VOD items are relevant
    const items: M3UItem[] = vodData
      .map((item: XuiOneVodInfo) => {
        const categoryName = item.category_id ? categoryMap.get(item.category_id) : 'Desconhecida';
        
        // Exclude live channels if they appear in the VOD list
        if (categoryName && (categoryName.toLowerCase().includes('canais') || categoryName.toLowerCase().includes('live'))) {
          return null;
        }

        return {
          name: item.name,
          logo: item.stream_icon || null,
          category: categoryName || 'Desconhecida',
          url: '', // URL is not needed for checking existence
          synopsis: '', // Synopsis will be fetched from TMDB
        };
      })
      .filter((item): item is M3UItem => item !== null); // Filter out the null items
      
    return items;

  } catch (error) {
    console.error('Error fetching or parsing data from XUI One API:', error);
    return [];
  }
}
