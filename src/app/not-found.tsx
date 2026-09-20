import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-canvas selection:bg-vector selection:text-white"
    >
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        {/* Subtle decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 size-64 rounded-full bg-vector/15 blur-3xl"
        />

        {/* Brand mark */}
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <ShieldAlert className="size-8 text-vector" aria-hidden />
        </div>

        {/* 404 badge */}
        <span className="inline-block rounded-full bg-vector/20 px-3.5 py-1 text-xs font-black tracking-widest text-vector">
          404 — صفحة غير موجودة
        </span>

        {/* Headings */}
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          عفوًا، لم نتمكن من العثور على الصفحة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-canvas/60 sm:text-base">
          ربما تم نقل الصفحة أو إزالتها أو كتابة الرابط بشكل غير دقيق.
        </p>
        <p className="mt-1 text-xs text-canvas/40" dir="ltr">
          The page you requested could not be found or has been relocated.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-11 rounded-xl bg-vector px-6 text-sm font-bold text-white shadow-lg shadow-vector/25 transition-transform hover:-translate-y-0.5 hover:bg-vector/90"
          >
            <Link href="/">
              <Home className="size-4 ms-1" aria-hidden />
              العودة للرئيسية
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-white/5 px-6 text-sm font-bold text-canvas hover:bg-white/10 hover:text-white"
          >
            <Link href="/#contact">
              تواصل معنا
              <ArrowLeft className="size-4 me-1" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-xs text-canvas/30">
          مُتَّجَه | MUTJAH &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
