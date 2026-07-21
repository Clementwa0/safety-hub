"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatKES } from "@/lib/cart";
import CheckoutButton from "./CheckoutButton";

interface CartSummaryProps {
  subtotal: number;
  vat: number;
  total: number;
  itemCount: number;
  onClear: () => void;
}

export default function CartSummary({ subtotal, vat, total, itemCount, onClear }: CartSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-[170px]">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium">{formatKES(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">VAT (16%)</span>
          <span className="font-medium">{formatKES(vat)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-base font-bold">
          <span>Grand Total</span>
          <span className="text-secondary">{formatKES(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <CheckoutButton />
        <Button type="button" variant="ghost" className="w-full" onClick={onClear}>
          Clear Cart
        </Button>
      </CardFooter>
    </Card>
  );
}