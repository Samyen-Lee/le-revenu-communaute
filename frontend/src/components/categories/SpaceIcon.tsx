import {
  Armchair,
  Building,
  ChartCandlestick,
  Coffee,
  Gem,
  Globe,
  type LucideIcon,
  MessageCircle,
  PiggyBank,
  Receipt,
  Umbrella,
  Users,
  Wallet,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { Category, CategoryIconName } from '@/lib/strapi/types';

/** Les icônes sont choisies dans l'admin Strapi (énumération) et associées ici aux pictos Lucide. */
const ICONS: Record<CategoryIconName, LucideIcon> = {
  candles: ChartCandlestick,
  globe: Globe,
  piggy: PiggyBank,
  umbrella: Umbrella,
  building: Building,
  receipt: Receipt,
  armchair: Armchair,
  family: Users,
  gem: Gem,
  wallet: Wallet,
  coffee: Coffee,
  message: MessageCircle,
};

const SIZES = { sm: '22px', md: '28px', lg: '40px', xl: '56px' } as const;

export function SpaceIcon({ category, size = 'sm' }: { category: Pick<Category, 'icon' | 'color'>; size?: keyof typeof SIZES }) {
  const Icon = ICONS[category.icon] ?? MessageCircle;
  return (
    <span aria-hidden className={cn('space-icon')} style={{ '--c': category.color, '--s': SIZES[size] } as CSSProperties}>
      <Icon strokeWidth={2.2} />
    </span>
  );
}
