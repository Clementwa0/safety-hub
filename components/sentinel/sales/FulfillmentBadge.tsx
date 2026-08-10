import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  available: "Available now",
  partial: "Partial stock",
  procurement: "Procurement required",
};

const VARIANTS: Record<string, "outline" | "secondary" | "destructive"> = {
  available: "outline",
  partial: "secondary",
  procurement: "destructive",
};

export function FulfillmentBadge({ plan }: { plan?: string }) {
  if (!plan || !LABELS[plan]) return null;
  return <Badge variant={VARIANTS[plan]}>{LABELS[plan]}</Badge>;
}

export default FulfillmentBadge;
