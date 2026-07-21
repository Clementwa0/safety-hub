import ProductCard from '@/components/products/components/Product-Card';
import type { Product } from '@/data/products';

interface ProductRelatedProps {
  products: Product[];
}

export function ProductRelated({ products }: ProductRelatedProps) {
  if (!products.length) return null;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Recommended</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Related products</h2>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
