"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Inbox, Loader2, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type LeadRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  audienceType: string;
  needType: string;
  scope: string | null;
  message: string;
  locale: string;
  source: string;
  status: string;
  createdAt: string;
};

const NEED_LABELS: Record<string, string> = {
  website: "موقع أو حضور رقمي",
  product: "منتج أو منصة",
  system: "نظام داخلي",
  automation: "أتمتة أو ذكاء اصطناعي",
  support: "دعم أو تطوير قائم",
  unsure: "لست متأكدًا بعد",
};

const AUDIENCE_LABELS: Record<string, string> = {
  business: "شركة أو نشاط تجاري",
  founder: "مؤسس أو محترف",
};

const STATUS_FILTERS = [
  { value: "all", label: "الكل" },
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "qualified", label: "مؤهل" },
  { value: "closed", label: "مغلق" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-vector/15 text-vector",
  contacted: "bg-amber-500/15 text-amber-600",
  qualified: "bg-emerald-500/15 text-emerald-600",
  closed: "bg-ink/10 text-ink/60",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) +
    " · " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export function LeadsTab() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState<LeadRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/leads", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length, new: 0, contacted: 0, qualified: 0, closed: 0 };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter]
  );

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />)}</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-dashed border-ink/15">
        <Button size="sm" variant="outline" onClick={load} className="rounded-xl">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="تصفية الطلبات">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                filter === f.value ? "bg-ink text-canvas" : "bg-white text-ink/60 hover:bg-ink/5"
              )}
            >
              {f.label}
              <span className="ms-1.5 text-xs opacity-60">{counts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <Button asChild size="sm" variant="outline" className="h-10 rounded-xl border-ink/15">
          <a href="/api/admin/leads/export" download>
            <Download className="size-4" aria-hidden />
            تصدير CSV
          </a>
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/50">
          <Inbox className="size-10 text-ink/20" aria-hidden />
          <p className="text-sm font-semibold text-ink/40">
            {filter === "all" ? "لا طلبات بعد — أول طلب من الموقع سيظهر هنا" : "لا طلبات في هذه الحالة"}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((l) => (
            <li key={l.id}>
              <Card className="border-ink/10">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-ink">{l.name}</h3>
                        {l.company && <span className="text-sm font-semibold text-ink/50">{l.company}</span>}
                        <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold", STATUS_STYLES[l.status] ?? "")}>
                          {STATUS_FILTERS.find((f) => f.value === l.status)?.label ?? l.status}
                        </span>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink/45">
                        <span>{formatDate(l.createdAt)}</span>
                        <span>{AUDIENCE_LABELS[l.audienceType] ?? l.audienceType}</span>
                        <span className="text-vector">{NEED_LABELS[l.needType] ?? l.needType}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={l.status}
                        onChange={(e) => setStatus(l.id, e.target.value)}
                        aria-label={`حالة طلب ${l.name}`}
                        className="h-9 rounded-xl border border-ink/15 bg-white px-2 text-xs font-bold text-ink"
                      >
                        <option value="new">جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="qualified">مؤهل</option>
                        <option value="closed">مغلق</option>
                      </select>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`حذف طلب ${l.name}`}
                        onClick={() => setDeleting(l)}
                        className="size-9 rounded-lg text-coral/80 hover:bg-coral/10 hover:text-coral"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>

                  {/* Contact + message */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {l.email && (
                      <a
                        href={`mailto:${l.email}`}
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-bold text-ink/70 transition-colors hover:text-vector"
                      >
                        <Mail className="size-3.5" aria-hidden />
                        {l.email}
                      </a>
                    )}
                    {l.phone && (() => {
                      const cleanDigits = l.phone.replace(/[^0-9]/g, "");
                      return cleanDigits ? (
                        <a
                          href={`https://wa.me/${cleanDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-bold text-ink/70 transition-colors hover:text-vector"
                        >
                          <Phone className="size-3.5" aria-hidden />
                          {l.phone}
                        </a>
                      ) : (
                        <span
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-mist-50 px-2.5 py-1.5 text-xs font-bold text-ink/70"
                        >
                          <Phone className="size-3.5" aria-hidden />
                          {l.phone}
                        </span>
                      );
                    })()}
                  </div>

                  <p
                    className={cn(
                      "mt-3 cursor-pointer rounded-xl bg-canvas-soft px-4 py-3 text-sm leading-7 text-ink/75",
                      expanded !== l.id && "line-clamp-2"
                    )}
                    onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setExpanded(expanded === l.id ? null : l.id)}
                    aria-expanded={expanded === l.id}
                  >
                    {l.message}
                  </p>

                  {busyId === l.id && (
                    <Loader2 className="mt-2 size-4 animate-spin text-ink/40" aria-hidden />
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl bg-canvas">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="font-extrabold text-ink">
              حذف طلب «{deleting?.name}» نهائيًا؟
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-7 text-ink/60">
              يُفضَّل تغيير حالته إلى «مغلق» بدلًا من الحذف للحفاظ على سجل العملاء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl border-ink/15">تراجع</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove(deleting.id)}
              className="rounded-xl bg-coral font-bold text-white hover:bg-coral/90"
            >
              {busyId === deleting?.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "حذف نهائي"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
