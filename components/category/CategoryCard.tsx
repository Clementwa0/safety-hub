import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { FaArrowRight } from "react-icons/fa6";
import type { StaticImageData } from "next/image";

interface CategoryCardProps {
  title: string;
  image: StaticImageData;
  count: number;
  href: string;
}

export function CategoryCard({
  title,
  image,
  count,
  href,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-secondary/30 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width:640px) 100vw,
                 (max-width:1024px) 50vw,
                 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <Badge className="absolute left-4 top-4 bg-white text-slate-900 hover:bg-white">
          {count} Products
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-2 p-3">

        <div>
          <h3 className=" text-2sm md:text-xl font-bold text-slate-900 transition-colors group-hover:text-secondary">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t pt-2">

          <span className="text-xs md:text-sm font-medium text-slate-500">
            Browser Category
          </span>

          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-secondary text-white transition-all duration-300 group-hover:translate-x-1">
            <FaArrowRight className="h-4 w-4" />
          </div>

        </div>

      </div>
    </Link>
  );
}