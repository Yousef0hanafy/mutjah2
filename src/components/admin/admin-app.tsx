"use client";

import { useEffect, useState } from "react";
import { BarChart3, ExternalLink, LayoutGrid, Loader2, LogOut, MessageSquareQuote, MessagesSquare, Newspaper, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardTab } from "./dashboard-tab";
import { ProjectsTab } from "./projects-tab";
import { TestimonialsTab } from "./testimonials-tab";
import { FaqTab } from "./faq-tab";
import { ServicesTab } from "./services-tab";
import { LeadsTab } from "./leads-tab";
import { SettingsTab } from "./settings-tab";

/* ── Types ────────────────────────────────────────────────────────────────── */

export type AdminTabKey =
  | "dashboard"
  | "projects"
  | "testimonials"
  | "faq"
  | "services"
  | "leads"
  | "settings";

export const ADMIN_TABS: Array<{ key: AdminTabKey; label: string; icon: React.ElementType; phase: number }> = [
  { key: "dashboard", label: "لوحة القيادة", icon: BarChart3, phase: 1 },
  { key: "projects", label: "المشاريع", icon: LayoutGrid, phase: 2 },
  { key: "testimonials", label: "آراء العملاء", icon: MessageSquareQuote, phase: 3 },
  { key: "faq", label: "الأسئلة الشائعة", icon: MessagesSquare, phase: 4 },
  { key: "services", label: "الخدمات", icon: Newspaper, phase: 4 },
  { key: "leads", label: "الطلبات", icon: MessagesSquare, phase: 5 },
  { key: "settings", label: "الإعدادات", icon: Settings, phase: 6 },
];

/* ── Login screen ─────────────────────────────────────────────────────────── */

function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onLogin(data.email);
      } else if (res.status === 429) {
        setError("محاولات كثيرة جدًا. انتظر ١٥ دقيقة ثم أعد المحاولة.");
      } else {
        setError("بيانات الدخول غير صحيحة.");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. أعد المحاولة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-vector/15">
            <ShieldCheck className="size-7 text-vector" aria-hidden />
          </div>
          <h1 className="text-2xl font-extrabold text-canvas">لوحة تحكم مُتَّجَه</h1>
          <p className="mt-2 text-sm text-canvas/50">الدخول مخصص لفريق مُتَّجَه فقط</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-canvas/80">
              البريد الإلكتروني
            </label>
            <Input
              id="admin-email"
              type="email"
              dir="ltr"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/15 bg-white/10 text-left text-canvas placeholder:text-canvas/30"
              placeholder="you@mutjah.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-canvas/80">
              كلمة المرور
            </label>
            <Input
              id="admin-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/10 text-left text-canvas placeholder:text-canvas/30"
              placeholder="••••••••••"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-coral/15 px-3 py-2 text-sm font-semibold text-coral">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-vector text-base font-bold text-white hover:bg-vector/90"
          >
            {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : "دخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ── Placeholder for tabs built in later phases ───────────────────────────── */

export function ComingSoon({ phase }: { phase: number }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/50">
      <p className="text-sm font-semibold text-ink/40">هذا القسم يُفعَّل في المرحلة {phase} من خطة البناء</p>
    </div>
  );
}

/* ── Admin app shell ──────────────────────────────────────────────────────── */

export function AdminApp() {
  const [status, setStatus] = useState<"checking" | "login" | "panel">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTabKey>("dashboard");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (!cancelled && data?.ok) {
            setEmail(data.email ?? null);
            setStatus("panel");
            return;
          }
        }
        if (!cancelled) setStatus("login");
      })
      .catch(() => {
        if (!cancelled) setStatus("login");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="size-8 animate-spin text-vector" aria-label="جارٍ التحقق" />
      </div>
    );
  }

  if (status === "login") {
    return (
      <LoginScreen
        onLogin={(e) => {
          setEmail(e);
          setStatus("panel");
        }}
      />
    );
  }

  const activeTab = ADMIN_TABS.find((t) => t.key === tab) ?? ADMIN_TABS[0];

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-ink">مُتَّجَه</span>
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-canvas">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-9 text-sm font-semibold text-ink/70 hover:bg-ink/5 hover:text-ink"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                عرض الموقع
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                setStatus("login");
                setEmail(null);
              }}
              className="h-9 rounded-xl border-ink/15 text-sm font-semibold text-ink/80 hover:bg-coral/10 hover:text-coral"
            >
              <LogOut className="size-4" aria-hidden />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        {/* Tab nav */}
        <nav aria-label="أقسام لوحة التحكم" className="lg:w-56 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {ADMIN_TABS.map((t) => {
              const Icon = t.icon;
              const active = t.key === tab;
              return (
                <li key={t.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-ink text-canvas shadow-sm"
                        : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                    )}
                  >
                    <Icon className="size-4.5 shrink-0" aria-hidden />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
          {email && (
            <p className="mt-4 hidden truncate px-4 text-xs text-ink/40 lg:block" dir="ltr" title={email}>
              {email}
            </p>
          )}
        </nav>

        {/* Active tab content */}
        <main className="min-w-0 flex-1">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "faq" && <FaqTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "leads" && <LeadsTab />}
          {tab === "settings" && <SettingsTab />}
          {tab !== "dashboard" && tab !== "projects" && tab !== "testimonials" && tab !== "faq" && tab !== "services" && tab !== "leads" && tab !== "settings" && (
            <Card className="border-ink/10">
              <CardContent className="p-6">
                <h2 className="mb-1 text-lg font-extrabold text-ink">{activeTab.label}</h2>
                <ComingSoon phase={activeTab.phase} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
