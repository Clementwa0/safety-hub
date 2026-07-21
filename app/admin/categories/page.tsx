import { FaLayerGroup } from "react-icons/fa6";

export default function AdminCategoriesPage() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-secondary/10 p-3 text-secondary">
          <FaLayerGroup className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories and taxonomy.</p>
        </div>
      </div>
    </div>
  );
}
