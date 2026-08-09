import type { ReactNode } from "react";
import { SentinelLayout } from "@/components/layouts";

export default function Layout({ children }: { children: ReactNode }) {
  return <SentinelLayout>{children}</SentinelLayout>;
}
