
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

// State to hold items globally, outside of the component lifecycle
let cachedItems: M3UItem[] | null = null;

export const M3uProvider = ({ children }: { children: ReactNode }) => {
  const [m3uItems, setM3uItems] = useState<M3UItem[]>(cachedItems || []);
  const [isLoading, setIsLoading] = useState(!cachedItems);

  useEffect(() => {
    const loadItems = async () => {
      // Only load if the cache is empty
      if (cachedItems) {
        return;
      }
      setIsLoading(true);
      try {
        const items = await getM3UItems();
        cachedItems = items; // Store items in the global cache
        setM3uItems(items);
      } catch (error) {
        console.error("Failed to load M3U items for context:", error);
        cachedItems = []; // Ensure cache is an array on error
        setM3uItems([]); 
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
