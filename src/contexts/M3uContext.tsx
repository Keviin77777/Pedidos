
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { getM3UItems } from '@/lib/m3u';
import type { M3UItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface M3uContextType {
  m3uItems: M3UItem[];
  isLoading: boolean;
  error: string | null;
}

export const M3uContext = createContext<M3uContextType>({
  m3uItems: [],
  isLoading: true,
  error: null,
});

export const M3uProvider = ({ children }: { children: ReactNode }) => {
  const [m3uItems, setM3uItems] = useState<M3UItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchM3uData = async () => {
      try {
        const items = await getM3UItems();
        setM3uItems(items);
      } catch (err) {
        const errorMessage = 'Não foi possível carregar a lista de conteúdos existentes. A busca pode não ser precisa.';
        setError(errorMessage);
        console.error("Failed to load M3U cache:", err);
        toast({
          title: 'Erro ao carregar lista local',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchM3uData();
  }, [toast]);

  return (
    <M3uContext.Provider value={{ m3uItems, isLoading, error }}>
      {children}
    </M3uContext.Provider>
  );
};
