import { MainColumn, SideColumn } from '@/components/layout/PageColumns';
import { CardSkeleton, DiscussionSkeleton } from '@/components/ui/Skeletons';

export default function DiscussionLoading() {
  return (
    <>
      <MainColumn>
        <DiscussionSkeleton />
      </MainColumn>
      <SideColumn>
        <CardSkeleton lines={4} />
      </SideColumn>
    </>
  );
}
