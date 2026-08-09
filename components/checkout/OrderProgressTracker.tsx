import { FaCheck } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import type { StoreOrderStatus } from "@/types/storefront/store-order";

const STEPS: { key: StoreOrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export function OrderProgressTracker({ status }: { status: StoreOrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <ol className="flex flex-col gap-3">
      {STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                isComplete
                  ? "border-secondary bg-secondary text-white"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {isComplete ? <FaCheck className="h-3 w-3" /> : index + 1}
            </span>
            <span className={cn("text-sm", isComplete ? "font-medium text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
