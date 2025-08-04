'use client';

import Image from 'next/image';
import type { M3UItem } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ContentCardProps {
  item: M3UItem;
}

export default function ContentCard({ item }: ContentCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardHeader className="p-0">
        <div className="aspect-[2/3] relative">
          <Image
            src={item.logo || 'https://placehold.co/400x600.png'}
            alt={`Cover for ${item.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            data-ai-hint="movie poster"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-base font-bold leading-tight line-clamp-2">
          {item.name}
        </CardTitle>
        <div className="text-xs text-muted-foreground h-16 overflow-y-auto">
          <p className="line-clamp-4">{item.synopsis || 'No synopsis available.'}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Badge variant="secondary" className="truncate">{item.category}</Badge>
      </CardFooter>
    </Card>
  );
}
