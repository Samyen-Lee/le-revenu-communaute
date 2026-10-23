import { MainColumn } from '@/components/layout/PageColumns';
import { DiscussionListSkeleton } from '@/components/ui/Skeletons';

export default function MemberLoading() {
  return (
    <MainColumn wide>
      <div aria-hidden className="skeleton h-[140px] rounded-card" />
      <DiscussionListSkeleton rows={3} />
    </MainColumn>
  );
}
