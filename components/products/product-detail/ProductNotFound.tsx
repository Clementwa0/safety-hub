import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaHouse } from "react-icons/fa6";

interface ProductNotFoundProps {
  productId?: string;
}

export function ProductNotFound({ productId }: ProductNotFoundProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="rounded-full bg-secondary/10 p-4 text-secondary">
        <FaHouse className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">
        Product not found
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
        The product you are looking for is unavailable or no longer exists. You
        can browse the catalog or head back to the shop.
      </p>
      {productId && (
        <p className="mt-2 text-sm text-slate-500">
          Requested product: {productId}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/shop" />}>
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Back to shop
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
