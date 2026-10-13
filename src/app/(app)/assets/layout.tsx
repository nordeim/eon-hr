import type { Metadata } from "next";
import { pageMetadata } from "@/lib/meta";

export const metadata: Metadata = pageMetadata("/assets");

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
