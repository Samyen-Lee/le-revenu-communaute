import { MainColumn } from '@/components/layout/PageColumns';

export default function SpacesLoading() {
  return (
    <MainColumn wide>
      <div aria-hidden className="skeleton h-16 w-80 max-w-full" />
      <div aria-hidden className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton h-40 rounded-card" />
        ))}
      </div>
    </MainColumn>
  );
}
