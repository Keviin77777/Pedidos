
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { M3UItem } from '@/lib/types';
import { getM3UItems } from '@/lib/m3u';

interface M3uContextType {
  m3uItems: M3UItem[];
  isLoading: boolean;
}

export const M3uContext = createContext<M3uContextType>({
  m3uItems: [],
  isLoading: true,
});

export const M3uProvider = ({ children }: { children: ReactNode }) => {
  const [m3uItems, setM3uItems] = useState<M3UItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getM3UItems();
        setM3uItems(items);
      } catch (error) {
        console.error("Failed to load M3U items for context:", error);
        setM3uItems([]); // Ensure it's an array even on error
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  return (
    <M3uContext.Provider value={{ m3uItems, isLoading }}>
      {children}
    </M3uContext.Provider>
  );
};
