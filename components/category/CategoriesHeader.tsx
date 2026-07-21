import { FaCommentDots } from "react-icons/fa6";
import { CategoryStats } from "./CategoryStats";

interface CategoriesHeaderProps {
  title?: string;
  description?: string;
}

export function CategoriesHeader({
  title = "Shop by Category",
  description = "Browse our comprehensive range of certified PPE and safety equipment.",
}: CategoriesHeaderProps) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Available Categories
        </span>
        <h2 className="mt-2 text-2xl font-bold text-primary md:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCommentDots size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Need help choosing?</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Chat with our safety experts on{' '}
                    <span className="text-green-700 font-bold">WhatsApp</span>
                  </p>
                </div>
              </div>
            </div>

    </div>
  );
}