import { CategoryPage } from "@/features/catalog/categories";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function Page({ params }: PageProps) {
  return <CategoryPage params={params} />;
}