
'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { M3UItem } from '@/lib/types';
import { getM3UItems, getAllM3UItems } from '@/lib/m3u';

interface M3uContextType {
  m3uItems: M3UItem[];
  allM3uItems: M3UItem[]; // Todos os itens para comparação
  isInitialLoading: boolean; // Renamed to reflect its purpose
}

export const M3uContext = createContext<M3uContextType>({
  m3uItems: [],
  allM3uItems: [],
  isInitialLoading: true,
});

// State to hold items globally, outside of the component lifecycle
let cachedItems: M3UItem[] | null = null;
let cachedAllItems: M3UItem[] | null = null;
let hasLoadedInitially = false;

export const M3uProvider = ({ children }: { children: ReactNode }) => {
  const [m3uItems, setM3uItems] = useState<M3UItem[]>(cachedItems || []);
  const [allM3uItems, setAllM3uItems] = useState<M3UItem[]>(cachedAllItems || []);
  const [isInitialLoading, setIsInitialLoading] = useState(!hasLoadedInitially);

  useEffect(() => {
    const loadItems = async () => {
      // Only load if the cache is empty and it hasn't loaded before.
      if (hasLoadedInitially) {
        return;
      }
      
      try {
        const [items, allItems] = await Promise.all([
          getM3UItems(),
          getAllM3UItems()
        ]);
        cachedItems = items; // Store items in the global cache
        cachedAllItems = allItems; // Store all items in the global cache
        setM3uItems(items);
        setAllM3uItems(allItems);
      } catch (error) {
        console.error("Failed to load M3U items for context:", error);
        cachedItems = []; // Ensure cache is an array on error
        cachedAllItems = [];
        setM3uItems([]); 
        setAllM3uItems([]);
      } finally {
        setIsInitialLoading(false);
        hasLoadedInitially = true; // Mark that initial load has completed
      }
    };
    
    loadItems();
  }, []);

  return (
    <M3uContext.Provider value={{ m3uItems, allM3uItems, isInitialLoading }}>
      {children}
    </M3uContext.Provider>
  );
};
