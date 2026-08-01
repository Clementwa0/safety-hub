import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface PageHeaderBreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: PageHeaderBreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition hover:text-green-600">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-gray-900" : "text-gray-500"}>
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </div>
            );
          })}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
