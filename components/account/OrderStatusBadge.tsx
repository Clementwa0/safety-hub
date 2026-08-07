import { Badge } from "@/components/ui/badge";
import type { StoreOrderStatus } from "@/types/store-order";

const STATUS_STYLES: Record<StoreOrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export function OrderStatusBadge({ status }: { status: StoreOrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </Badge>
  );
}
