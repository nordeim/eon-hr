import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// No next/font: the reference app renders Tailwind v4's default
// ui-sans-serif stack (session-4 measurement) — see globals.css.

export const metadata: Metadata = {
  title: {
    default: "Eon HR",
    template: "%s | Eon HR",
  },
  description:
    "Eon HR — modern HR management: employees, payroll, recruitment, training, compliance, performance, analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
