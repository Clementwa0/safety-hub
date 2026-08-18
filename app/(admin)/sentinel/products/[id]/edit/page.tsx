import EditProduct from "@/features/sentinel/products/EditProduct";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product | Admin",
  description: "Update product details.",
};

export default async function Page() {
 return <EditProduct  />;
}