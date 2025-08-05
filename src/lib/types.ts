export interface M3UItem {
  name: string;
  logo: string | null;
  category: string;
  url: string;
  synopsis?: string;
  type?: 'movie' | 'series';
}
