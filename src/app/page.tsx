import ContentGrid from '@/components/content-grid';
import Header from '@/components/header';
import { getM3UItems } from '@/lib/m3u';
import type { M3UItem } from '@/lib/types';
import { getSynopsis } from './actions';

export default async function Home() {
  const items: M3UItem[] = await getM3UItems();

  const itemsWithSynopsis = await Promise.all(
    items.map(async (item) => {
      const synopsis = await getSynopsis(item.name);
      return { ...item, synopsis };
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ContentGrid allItems={itemsWithSynopsis} />
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>CineAssist &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
