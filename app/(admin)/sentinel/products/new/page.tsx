import NewProduct from "@/features/sentinel/products/NewProduct";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product | Admin",
  description: "Create a new product.",
};

export default function Page() {
  return <NewProduct />;
}