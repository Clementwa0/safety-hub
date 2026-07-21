import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product - HSE Hub Admin",
  description: "Edit an existing product entry",
};

export default function EditProductPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>
        <p className="mt-2 text-sm text-slate-600">Update product details from the admin console.</p>
      </div>
    </div>
  );
}
