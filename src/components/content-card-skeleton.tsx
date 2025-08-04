
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

export default function ContentCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[2/3] w-full" />
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <Skeleton className="h-5 w-4/5" />
        <div className="space-y-1 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-5 w-1/2" />
      </CardFooter>
    </Card>
  );
}
