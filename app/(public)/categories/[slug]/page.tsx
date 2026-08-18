import CategoryPage from "@/features/storefront/catalog/categories/[id]/CategoryPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function Page({ params }: PageProps) {
  return <CategoryPage params={params} />;
}