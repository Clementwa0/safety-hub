import { hasVariants, type Product } from '@/types/product';
import ProductCard from '../components/ProductCard';

interface ProductRelatedProps {
  products: Product[];
}

export function ProductRelated({ products }: ProductRelatedProps) {
  if (!products.length) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Recommended
          </p>
          <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-slate-900">
            Related products
          </h2>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{ ...product, hasVariants: hasVariants(product) }}
            compact
          />
        ))}
      </div>
    </section>
  );
}