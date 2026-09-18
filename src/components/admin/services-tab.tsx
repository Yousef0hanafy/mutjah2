"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BilingualPair, PublishedSwitch, TextField } from "./ui";

type ServiceRecord = {
  id: string;
  order: number;
  icon: string;
  titleAr: string;
  titleEn: string;
  needAr: string;
  needEn: string;
  descAr: string;
  descEn: string;
  deliverablesAr: string;
  deliverablesEn: string;
  published: boolean;
};

type FormState = {
  icon: string;
  titleAr: string;
  titleEn: string;
  needAr: string;
  needEn: string;
  descAr: string;
  descEn: string;
  deliverablesAr: string;
  deliverablesEn: string;
  published: boolean;
};

const ICON_OPTIONS = [
  { value: "globe", label: "🌐 مواقع (globe)" },
  { value: "layout-grid", label: "▦ منتجات (layout-grid)" },
  { value: "database", label: "🗄 أنظمة (database)" },
  { value: "bot", label: "🤖 أتمتة وذكاء (bot)" },
  { value: "sparkles", label: "✦ عام (sparkles)" },
  { value: "settings", label: "⚙ أدوات (settings)" },
];

function parseTags(raw: string): string[] {
  return raw.split(/[,،]/).map((t) => t.trim()).filter(Boolean).slice(0, 10);
}

function formFromRecord(s: ServiceRecord): FormState {
  let dAr: string[] = [];
  let dEn: string[] = [];
  try {
    dAr = JSON.parse(s.deliverablesAr);
    dEn = JSON.parse(s.deliverablesEn);
  } catch {
    /* defaults */
  }
  return {
    icon: s.icon,
    titleAr: s.titleAr,
    titleEn: s.titleEn,
    needAr: s.needAr,
    needEn: s.needEn,
    descAr: s.descAr,
    descEn: s.descEn,
    deliverablesAr: dAr.join("، "),
    deliverablesEn: dEn.join(", "),
    published: s.published,
  };
}

function ServiceEditor({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial: FormState;
  saving: boolean;
  onSave: (f: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.titleAr.trim() && form.titleEn.trim() && form.descAr.trim() && form.descEn.trim() && form.needAr.trim() && form.needEn.trim();

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-canvas">
      <DialogHeader className="text-start">
        <DialogTitle className="text-lg font-extrabold text-ink">خدمة (باب)</DialogTitle>
        <DialogDescription className="text-sm text-ink/50">
          كل باب يظهر في قسم الخدمات — «متى تحتاجها؟» هي العبارة التي تفتح القلب عند العميل.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="svc-icon" className="text-[13px] font-bold text-ink/80">
              الأيقونة
            </label>
            <select
              id="svc-icon"
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm font-semibold text-ink"
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <TextField label="العنوان (عربي)" value={form.titleAr} onChange={(v) => set("titleAr", v)} required />
          <TextField label="Title (English)" value={form.titleEn} onChange={(v) => set("titleEn", v)} ltr required />
        </div>

        <BilingualPair
          labelAr="متى تحتاجها؟ (عربي)"
          labelEn="When you need it (English)"
          valueAr={form.needAr}
          valueEn={form.needEn}
          onChangeAr={(v) => set("needAr", v)}
          onChangeEn={(v) => set("needEn", v)}
          multiline
          rows={2}
        />

        <BilingualPair
          labelAr="الوصف (عربي)"
          labelEn="Description (English)"
          valueAr={form.descAr}
          valueEn={form.descEn}
          onChangeAr={(v) => set("descAr", v)}
          onChangeEn={(v) => set("descEn", v)}
          multiline
          rows={3}
        />

        <BilingualPair
          labelAr="ماذا تشمل؟ (عربي) — افصل بفاصلة"
          labelEn="Deliverables (English) — comma separated"
          valueAr={form.deliverablesAr}
          valueEn={form.deliverablesEn}
          onChangeAr={(v) => set("deliverablesAr", v)}
          onChangeEn={(v) => set("deliverablesEn", v)}
          multiline
          rows={2}
        />

        <PublishedSwitch published={form.published} onChange={(v) => set("published", v)} />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl text-ink/60">
          إلغاء
        </Button>
        <Button
          type="button"
          disabled={!valid || saving}
          onClick={() => onSave(form)}
          className="rounded-xl bg-ink font-bold text-canvas hover:bg-vector"
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          حفظ
        </Button>
      </div>
    </DialogContent>
  );
}

export function ServicesTab() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<{ mode: "create" | "edit"; record: ServiceRecord | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServices(data.services);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form: FormState) {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        icon: form.icon,
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim(),
        needAr: form.needAr.trim(),
        needEn: form.needEn.trim(),
        descAr: form.descAr.trim(),
        descEn: form.descEn.trim(),
        deliverablesAr: parseTags(form.deliverablesAr),
        deliverablesEn: parseTags(form.deliverablesEn),
        published: form.published,
      };
      const res =
        editing.mode === "create"
          ? await fetch("/api/admin/services", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/services/${editing.record!.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
      if (!res.ok) throw new Error();
      setEditing(null);
      await load();
    } catch {
      alert("تعذر الحفظ — أعد المحاولة");
    } finally {
      setSaving(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    [next[index], next[target]] = [next[target], next[index]];
    setServices(next);
    await fetch("/api/admin/services/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((s, i) => ({ id: s.id, order: i })) }),
    });
  }

  const sorted = useMemo(() => [...services].sort((a, b) => a.order - b.order), [services]);

  if (loading) {
    return <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink/5" />)}</div>;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/55">{sorted.length} خدمة — تظهر بترتيبها في قسم «أربعة أبواب»</p>
        <Button size="sm" onClick={() => setEditing({ mode: "create", record: null })} className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector">
          <Plus className="size-4" aria-hidden />
          خدمة جديدة
        </Button>
      </div>

      <ul className="space-y-3">
        {sorted.map((s, i) => (
          <li key={s.id}>
            <Card className={cn("border-ink/10 transition-opacity", !s.published && "opacity-60")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-extrabold text-ink">{s.titleAr}</h3>
                    <Badge variant="outline" className="rounded-full border-ink/15 text-[11px] text-ink/50" dir="ltr">
                      {s.icon}
                    </Badge>
                    {!s.published && <Badge className="rounded-full bg-coral/15 text-[11px] text-coral">مسودة</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/55">{s.needAr}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label={`تقديم ${s.titleAr}`} disabled={i === 0} onClick={() => move(i, -1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تأخير ${s.titleAr}`} disabled={i === sorted.length - 1} onClick={() => move(i, 1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تعديل ${s.titleAr}`} onClick={() => setEditing({ mode: "edit", record: s })} className="size-9 rounded-lg text-ink/60 hover:bg-ink/5">
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`نشر/إخفاء ${s.titleAr}`}
                    disabled={busyId === s.id}
                    onClick={async () => {
                      setBusyId(s.id);
                      try {
                        await fetch(`/api/admin/services/${s.id}`, {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ published: !s.published }),
                        });
                        await load();
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    className={cn("size-9 rounded-lg", s.published ? "text-vector hover:bg-vector/10" : "text-ink/40 hover:bg-ink/5")}
                  >
                    <span className={cn("size-2.5 rounded-full", s.published ? "bg-vector" : "bg-ink/30")} />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`حذف ${s.titleAr}`} onClick={() => setDeleting(s)} className="size-9 rounded-lg text-coral/80 hover:bg-coral/10 hover:text-coral">
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {editing && (
        <Dialog open onOpenChange={(open) => !open && setEditing(null)}>
          <ServiceEditor
            initial={editing.mode === "edit" && editing.record ? formFromRecord(editing.record) : {
              icon: "sparkles",
              titleAr: "", titleEn: "", needAr: "", needEn: "", descAr: "", descEn: "",
              deliverablesAr: "", deliverablesEn: "", published: true,
            }}
            saving={saving}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Dialog>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl bg-canvas">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="font-extrabold text-ink">حذف الخدمة نهائيًا؟</AlertDialogTitle>
            <AlertDialogDescription className="leading-7 text-ink/60">
              «{deleting?.titleAr}» سيُزال من الموقع فورًا ولا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl border-ink/15">تراجع</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                setBusyId(deleting.id);
                try {
                  await fetch(`/api/admin/services/${deleting.id}`, { method: "DELETE" });
                  setDeleting(null);
                  await load();
                } finally {
                  setBusyId(null);
                }
              }}
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
