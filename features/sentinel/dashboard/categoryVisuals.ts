import {
  Ear,
  Footprints,
  Glasses,
  HardHat,
  Hand,
  Package,
  Shirt,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICONS: { match: RegExp; icon: LucideIcon; tint: string }[] = [
  { match: /head/i, icon: HardHat, tint: "bg-amber-100 text-amber-700" },
  { match: /eye/i, icon: Glasses, tint: "bg-sky-100 text-sky-700" },
  { match: /ear/i, icon: Ear, tint: "bg-violet-100 text-violet-700" },
  { match: /respirat/i, icon: Wind, tint: "bg-cyan-100 text-cyan-700" },
  { match: /hand/i, icon: Hand, tint: "bg-blue-100 text-blue-700" },
  { match: /foot/i, icon: Footprints, tint: "bg-orange-100 text-orange-700" },
  { match: /body|cloth/i, icon: Shirt, tint: "bg-emerald-100 text-emerald-700" },
];

export function categoryVisual(category?: string): { icon: LucideIcon; tint: string } {
  const found = category ? ICONS.find((entry) => entry.match.test(category)) : undefined;
  return found ?? { icon: Package, tint: "bg-slate-100 text-slate-600" };
}
