import { Skeleton } from '../ui/primitives.jsx';

/** Suspense fallback while a page chunk streams in. */
export default function PageLoader({ overlay = false }) {
  if (overlay) return null;
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-80 max-w-[60vw]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
