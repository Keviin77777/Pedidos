
'use server';

import type { M3UItem } from './types';

const M3U_URL = 'http://dnscine.top:80/playlist/Vodsm3u789DS/w5NwV8dPXE/m3u_plus';

const parseExtInfLine = (line: string): Partial<M3UItem> => {
  const attributes: Partial<M3UItem> = {};

  const nameMatch = line.match(/tvg-name="([^"]*)"/);
  if (nameMatch) {
    attributes.name = nameMatch[1];
  }

  const logoMatch = line.match(/tvg-logo="([^"]*)"/);
  if (logoMatch) {
    attributes.logo = logoMatch[1];
  }

  const groupTitleMatch = line.match(/group-title="([^"]*)"/);
  if (groupTitleMatch) {
    attributes.category = groupTitleMatch[1];
  }
  
  const commaSplit = line.split(',');
  if (commaSplit.length > 1 && !attributes.name) {
      attributes.name = commaSplit.slice(1).join(',').trim();
  }

  return attributes;
};

export async function getM3UItems(): Promise<M3UItem[]> {
  try {
    const response = await fetch(M3U_URL, {
      cache: 'no-store', // This should prevent the large file from being cached
    });

    if (!response.ok) {
      console.error('Failed to fetch M3U playlist:', response.statusText);
      // Return empty array to allow TMDB fallback
      return [];
    }

    const text = await response.text();
    const lines = text.split('\n');
    const items: M3UItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXTINF')) {
        const info = lines[i];
        const url = lines[i + 1];

        if (url && (url.startsWith('http') || url.startsWith('https'))) {
          const parsedInfo = parseExtInfLine(info);

          if (parsedInfo.category && parsedInfo.category.toLowerCase().includes('canais')) {
            continue;
          }

          if (parsedInfo.name) {
            items.push({
              name: parsedInfo.name,
              logo: parsedInfo.logo || null,
              category: parsedInfo.category || 'Desconhecida',
              url: url.trim(),
            });
          }
          i++;
        }
      }
    }
    return items;
  } catch (error) {
    console.error('Error fetching or parsing M3U playlist:', error);
    // On any error, return an empty array to ensure the app doesn't crash
    // and can proceed with TMDB search.
    return [];
  }
}
