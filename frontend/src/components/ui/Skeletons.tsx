/** Squelettes de chargement affichés par les frontières <Suspense> et les fichiers loading.tsx. */

export function DiscussionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Chargement des discussions" className="overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-1 gap-4 border-t border-line px-[18px] py-4 first:border-t-0 md:grid-cols-[62px_minmax(0,1fr)]">
          <div className="skeleton hidden h-[58px] w-[62px] rounded-sm md:block" />
          <div className="space-y-2.5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedToolbarSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="skeleton h-9 w-80 max-w-full rounded-control" />
      <div className="skeleton hidden h-9 w-40 rounded-control sm:block" />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden className="space-y-3 rounded-card border border-hairline bg-surface p-[18px] shadow-card">
      <div className="skeleton h-4 w-1/2" />
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="skeleton h-3.5 w-full" />
      ))}
    </div>
  );
}

export function DiscussionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement de la discussion" className="flex flex-col gap-[18px]">
      <div className="skeleton h-4 w-48" />
      <div className="space-y-4 rounded-card border border-hairline bg-surface px-[22px] py-5 shadow-card">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-8 w-4/5" />
        <div className="flex items-center gap-3">
          <div className="skeleton size-10 rounded-full" />
          <div className="skeleton h-3.5 w-40" />
        </div>
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-11/12" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
