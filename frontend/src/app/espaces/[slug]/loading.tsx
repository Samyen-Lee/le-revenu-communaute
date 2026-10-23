import { MainColumn, SideColumn } from '@/components/layout/PageColumns';
import { CardSkeleton, DiscussionListSkeleton, FeedToolbarSkeleton } from '@/components/ui/Skeletons';

export default function CategoryLoading() {
  return (
    <>
      <MainColumn>
        <div aria-hidden className="skeleton h-[118px] rounded-card" />
        <FeedToolbarSkeleton />
        <DiscussionListSkeleton />
      </MainColumn>
      <SideColumn>
        <CardSkeleton />
      </SideColumn>
    </>
  );
}
