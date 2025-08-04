
'use client';

import Image from 'next/image';
import type { M3UItem } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface ContentCardProps {
  item: M3UItem;
  showCategory?: boolean;
}

export default function ContentCard({ item, showCategory = true }: ContentCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300">
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
        <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
          {item.name}
        </CardTitle>
        <ScrollArea className="h-24">
           <p className="text-sm text-muted-foreground">{item.synopsis || 'No synopsis available.'}</p>
        </ScrollArea>
      </CardContent>
       {showCategory && item.category && (
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="truncate">{item.category}</Badge>
        </CardFooter>
      )}
    </Card>
  );
}

    