import type { Viewport } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { alexandria, manrope } from "@/lib/fonts";

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
};

/** Separate root layout: no analytics, no PWA registration, no indexing. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${alexandria.variable} ${manrope.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
