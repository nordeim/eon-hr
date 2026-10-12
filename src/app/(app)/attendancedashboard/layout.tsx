import type { Metadata } from "next";
import { pageMetadata } from "@/lib/meta";

export const metadata: Metadata = pageMetadata("/attendancedashboard");

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
