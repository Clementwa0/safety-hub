import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts";

export default function Layout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
