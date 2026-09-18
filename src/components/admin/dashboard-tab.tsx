"use client";

import { useEffect, useState } from "react";
import { Inbox, LayoutGrid, MessageSquare, MessagesSquare, Newspaper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Overview = {
  projects: number;
  publishedProjects: number;
  testimonials: number;
  faqItems: number;
  services: number;
  leads: number;
  newLeads: number;
  lastLead: { name: string; createdAt: string; status: string } | null;
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <Card className={cn("border-ink/10", accent && "border-vector/30 bg-vector/5")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink/50">{label}</p>
          <Icon className={cn("size-5", accent ? "text-vector" : "text-ink/30")} aria-hidden />
        </div>
        <p className="mt-2 text-3xl font-black tracking-tight text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs font-semibold text-ink/45">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function DashboardTab() {
  const [stats, setStats] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data.stats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-ink/10">
            <CardContent className="p-5">
              <div className="h-4 w-20 animate-pulse rounded bg-ink/10" />
              <div className="mt-3 h-9 w-14 animate-pulse rounded bg-ink/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/50">
        <p className="text-sm font-semibold text-ink/50">تعذر تحميل الإحصائيات</p>
        <Button size="sm" variant="outline" onClick={load} className="rounded-xl">
          <RefreshCw className="size-4" aria-hidden />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="طلبات جديدة"
          value={stats.newLeads}
          hint={stats.lastLead ? `آخر طلب: ${stats.lastLead.name}` : "لا طلبات بعد"}
          icon={Inbox}
          accent
        />
        <StatCard label="إجمالي الطلبات" value={stats.leads} icon={Inbox} />
        <StatCard
          label="المشاريع المنشورة"
          value={stats.publishedProjects}
          hint={stats.projects !== stats.publishedProjects ? `${stats.projects - stats.publishedProjects} مسودة` : "الكل منشور"}
          icon={LayoutGrid}
        />
        <StatCard label="آراء العملاء" value={stats.testimonials} hint="القسم يظهر عند أول رأي منشور" icon={MessageSquare} />
        <StatCard label="الأسئلة الشائعة" value={stats.faqItems} icon={MessagesSquare} />
        <StatCard label="الخدمات" value={stats.services} icon={Newspaper} />
      </div>

      <Card className="border-ink/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-extrabold text-ink">الخطوات القادمة</p>
            <p className="mt-1 text-sm text-ink/55">
              كل قسم من أقسام لوحة التحكم يُفعَّل تباعًا: المشاريع ← الآراء ← الأسئلة والخدمات ← الطلبات ← الإعدادات.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={load} className="rounded-xl border-ink/15">
            <RefreshCw className="size-4" aria-hidden />
            تحديث
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
