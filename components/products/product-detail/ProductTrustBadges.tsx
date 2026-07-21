import { Card } from '@/components/ui/card';
import { FaTruck, FaShieldHalved, FaCircleCheck, FaHeadset } from 'react-icons/fa6';

const features = [
  {
    title: 'Fast delivery',
    description: 'Reliable dispatch across Kenya',
    icon: FaTruck,
  },
  {
    title: 'Certified quality',
    description: 'Every product is quality checked',
    icon: FaShieldHalved,
  },
  {
    title: 'Warranty support',
    description: 'Help when you need it most',
    icon: FaCircleCheck,
  },
  {
    title: 'Live support',
    description: 'Talk to our safety specialists',
    icon: FaHeadset,
  },
];

export function ProductTrustBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {features.map(({ title, description, icon: Icon }) => (
        <Card key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
