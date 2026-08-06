"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatKES } from "@/lib/format";
import { WhatsAppOrderDialog } from "./WhatsAppOrderDialog";

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;
  onClear: () => void;
  clearing?: boolean;
}

export default function CartSummary({
  subtotal,
  shippingFee,
  tax,
  total,
  itemCount,
  onClear,
  clearing = false,
}: CartSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-[170px]">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} items)
          </span>
          <span className="font-medium">{formatKES(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">
            {shippingFee === 0 ? "Free" : formatKES(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">VAT (16%)</span>
          <span className="font-medium">{formatKES(tax)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-base font-bold">
          <span>Grand Total</span>
          <span className="text-secondary">{formatKES(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href="/shop" />}
        >
          Continue Shopping
        </Button>
        <Button
          className="w-full gap-2"
          nativeButton={false}
          render={<Link href="/checkout" />}
        >
          <span className="flex items-center gap-2">
            <span className="h-4 w-4">🔒</span>
            Proceed to Checkout
          </span>
        </Button>
        <WhatsAppOrderDialog />
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onClear}
          disabled={clearing}
        >
          Clear Cart
        </Button>
      </CardFooter>
    </Card>
  );
}