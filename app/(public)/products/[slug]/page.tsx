import ProductPage from "@/features/storefront/catalog/products/[id]/ProductPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function Page({ params }: PageProps) {
  return <ProductPage />;
}