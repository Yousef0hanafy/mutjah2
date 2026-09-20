"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime error for debugging
    console.error("[Application Error Boundary caught error]:", error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-canvas selection:bg-coral selection:text-white"
    >
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        {/* Decorative alert glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 size-64 rounded-full bg-coral/15 blur-3xl"
        />

        {/* Brand error mark */}
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-coral/20 bg-coral/10 shadow-inner">
          <AlertTriangle className="size-8 text-coral" aria-hidden />
        </div>

        {/* Badge */}
        <span className="inline-block rounded-full bg-coral/20 px-3.5 py-1 text-xs font-black tracking-wider text-coral">
          حدث خطأ غير متوقع
        </span>

        {/* Headings */}
        <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
          نعتذر، حدثت مشكلة أثناء تحميل المحتوى
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-canvas/60">
          فريق مُتَّجَه يعمل باستمرار لضمان استقرار المنصة. يمكنك إعادة المحاولة الآن.
        </p>

        {error.digest && (
          <p className="mt-2 text-[11px] font-mono text-canvas/30" dir="ltr">
            رمز الخطأ المرجعي: {error.digest}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="h-11 rounded-xl bg-coral px-6 text-sm font-bold text-white shadow-lg shadow-coral/20 transition-transform hover:-translate-y-0.5 hover:bg-coral/90"
          >
            <RotateCcw className="size-4 ms-1" aria-hidden />
            إعادة المحاولة
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-white/5 px-6 text-sm font-bold text-canvas hover:bg-white/10 hover:text-white"
          >
            <Link href="/">
              <Home className="size-4 ms-1" aria-hidden />
              العودة للرئيسية
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
