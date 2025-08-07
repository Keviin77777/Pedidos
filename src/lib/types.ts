export interface M3UItem {
  name: string;
  logo: string | null;
  category: string;
  url: string;
  synopsis?: string;
  type?: 'movie' | 'series';
  vod_id?: number; // ID para filmes
  series_id?: number; // ID para séries
}
