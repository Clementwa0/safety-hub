import Image from "next/image";
import { Breadcrumb } from "@/components/shared/ui-bits";
import CategoryHeroImage from "@/public/images/c-hero.png";

interface CategoryHeroProps {
  breadcrumbItems: Array<{ label: string; href?: string }>;
  badge?: string;
  title: string;
  highlight?: string;
  description: string;
}

export function CategoryHero({
  breadcrumbItems,
  badge,
  title,
  highlight,
  description,
}: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-secondary text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={CategoryHeroImage}
          alt=""
          fill
          priority
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 " />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 sm:py-10 lg:px-8 lg:py-14">

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-5 max-w-3xl">

          {badge && (
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur sm:px-4 sm:text-xs">
              {badge}
            </span>
          )}

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title}

            {highlight && (
              <span className="block text-accent">
                {highlight}
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
            {description}
          </p>

        </div>

      </div>
    </section>
  );
}