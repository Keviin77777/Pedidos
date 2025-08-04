'use client';

import { useState, useEffect, useMemo } from 'react';
import type { M3UItem } from '@/lib/types';
import ContentCard from './content-card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { RequestDialog } from './request-dialog';

interface ContentGridProps {
  allItems: M3UItem[];
}

export default function ContentGrid({ allItems }: ContentGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<M3UItem[]>(allItems);

  const lowerCaseQuery = searchQuery.toLowerCase();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        item.category.toLowerCase().includes(lowerCaseQuery) ||
        (item.synopsis && item.synopsis.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, allItems, lowerCaseQuery]);

  const showNotFound = useMemo(() => {
    return searchQuery.trim() !== '' && filteredItems.length === 0;
  }, [searchQuery, filteredItems.length]);

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por um filme ou série..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 text-lg py-6 rounded-full shadow-inner"
        />
      </div>

      {showNotFound ? (
        <div className="text-center py-16 px-6 bg-card rounded-xl shadow-md border border-dashed">
          <h2 className="text-2xl font-semibold text-card-foreground mb-2">
            Oops! Conteúdo não encontrado.
          </h2>
          <p className="text-muted-foreground mb-6">
            Ainda não temos "{searchQuery}" no nosso catálogo. Que tal fazer um pedido?
          </p>
          <RequestDialog initialValue={searchQuery} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map(item => (
            <ContentCard key={item.url} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
