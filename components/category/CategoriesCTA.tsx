import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

interface CategoriesCTAProps {
  href?: string;
  text?: string;
}

export function CategoriesCTA({
  href = "/shop",
  text = "View All Products",
}: CategoriesCTAProps) {
  return (
    <div className="mt-12 text-center">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-secondary/90 hover:shadow-md hover:-translate-y-0.5"
      >
        {text}
        <FaArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}