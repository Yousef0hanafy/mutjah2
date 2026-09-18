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
import {
  BilingualPair,
  ImageUploadField,
  PublishedSwitch,
  TextField,
} from "./ui";

type TestimonialRecord = {
  id: string;
  order: number;
  name: string;
  company: string | null;
  roleAr: string | null;
  roleEn: string | null;
  quoteAr: string;
  quoteEn: string;
  avatarPath: string | null;
  published: boolean;
};

type FormState = {
  name: string;
  company: string;
  roleAr: string;
  roleEn: string;
  quoteAr: string;
  quoteEn: string;
  avatarPath: string | null;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  company: "",
  roleAr: "",
  roleEn: "",
  quoteAr: "",
  quoteEn: "",
  avatarPath: null,
  published: true,
};

function formFromRecord(t: TestimonialRecord): FormState {
  return {
    name: t.name,
    company: t.company ?? "",
    roleAr: t.roleAr ?? "",
    roleEn: t.roleEn ?? "",
    quoteAr: t.quoteAr,
    quoteEn: t.quoteEn,
    avatarPath: t.avatarPath,
    published: t.published,
  };
}

function TestimonialEditor({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial: FormState;
  saving: boolean;
  onSave: (form: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.name.trim() && form.quoteAr.trim().length >= 10 && form.quoteEn.trim().length >= 10;

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-canvas">
      <DialogHeader className="text-start">
        <DialogTitle className="text-lg font-extrabold text-ink">رأي عميل</DialogTitle>
        <DialogDescription className="text-sm text-ink/50">
          انشر آراء حقيقية فقط وبإذن أصحابها — القسم يظهر على الموقع عند أول رأي منشور.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="الاسم" value={form.name} onChange={(v) => set("name", v)} required />
          <TextField
            label="الشركة / الجهة"
            hint="اختياري"
            value={form.company}
            onChange={(v) => set("company", v)}
          />
        </div>

        <BilingualPair
          labelAr="الصفة (عربي)"
          labelEn="Role (English)"
          valueAr={form.roleAr}
          valueEn={form.roleEn}
          onChangeAr={(v) => set("roleAr", v)}
          onChangeEn={(v) => set("roleEn", v)}
        />

        <BilingualPair
          labelAr="نص الرأي (عربي)"
          labelEn="Quote (English)"
          valueAr={form.quoteAr}
          valueEn={form.quoteEn}
          onChangeAr={(v) => set("quoteAr", v)}
          onChangeEn={(v) => set("quoteEn", v)}
          multiline
          rows={4}
        />

        <ImageUploadField
          label="صورة العميل"
          path={form.avatarPath}
          onChange={(p) => set("avatarPath", p)}
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

export function TestimonialsTab() {
  const [items, setItems] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<{ mode: "create" | "edit"; record: TestimonialRecord | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<TestimonialRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.testimonials);
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
        name: form.name.trim(),
        company: form.company.trim() || null,
        roleAr: form.roleAr.trim() || null,
        roleEn: form.roleEn.trim() || null,
        quoteAr: form.quoteAr.trim(),
        quoteEn: form.quoteEn.trim(),
        avatarPath: form.avatarPath,
        published: form.published,
      };
      const res =
        editing.mode === "create"
          ? await fetch("/api/admin/testimonials", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/testimonials/${editing.record!.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
      if (!res.ok) throw new Error();
      setEditing(null);
      await load();
    } catch {
      alert("تعذر الحفظ — تحقق من الحقول (الرأي ١٠ أحرف على الأقل) وأعد المحاولة");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await fetch("/api/admin/testimonials/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((t, i) => ({ id: t.id, order: i })) }),
    });
  }

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-dashed border-ink/15">
        <Button size="sm" variant="outline" onClick={load} className="rounded-xl">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/55">
          {sorted.length} رأي — القسم يظهر على الموقع عند وجود رأي منشور واحد على الأقل
        </p>
        <Button
          size="sm"
          onClick={() => setEditing({ mode: "create", record: null })}
          className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector"
        >
          <Plus className="size-4" aria-hidden />
          رأي جديد
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/50 text-center">
          <p className="text-sm font-semibold text-ink/40">لا آراء منشورة بعد</p>
          <p className="max-w-md text-xs leading-6 text-ink/35">
            حسب سياسة الصدق عند مُتَّجَه: تنشر الآراء الحقيقية فقط وبإذن أصحابها — القسم يبقى مخفيًا حتى أول رأي حقيقي.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((t, i) => (
          <li key={t.id}>
            <Card className={cn("border-ink/10 transition-opacity", !t.published && "opacity-60")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-mist-50">
                  {t.avatarPath ? (
                    <img src={t.avatarPath} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-black text-ink/40">
                      {t.name.trim().charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-ink">{t.name}</h3>
                    {t.company && (
                      <Badge variant="outline" className="rounded-full border-ink/15 text-[11px] text-ink/60">
                        {t.company}
                      </Badge>
                    )}
                    {!t.published && (
                      <Badge className="rounded-full bg-coral/15 text-[11px] text-coral">مسودة</Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/55">{t.quoteAr}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label={`تقديم ${t.name}`} disabled={i === 0} onClick={() => move(i, -1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تأخير ${t.name}`} disabled={i === sorted.length - 1} onClick={() => move(i, 1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تعديل ${t.name}`} onClick={() => setEditing({ mode: "edit", record: t })} className="size-9 rounded-lg text-ink/60 hover:bg-ink/5">
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`نشر/إخفاء ${t.name}`}
                    disabled={busyId === t.id}
                    onClick={async () => {
                      setBusyId(t.id);
                      try {
                        await fetch(`/api/admin/testimonials/${t.id}`, {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ published: !t.published }),
                        });
                        await load();
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    className={cn("size-9 rounded-lg", t.published ? "text-vector hover:bg-vector/10" : "text-ink/40 hover:bg-ink/5")}
                    title={t.published ? "إخفاء من الموقع" : "نشر على الموقع"}
                  >
                    <span className={cn("size-2.5 rounded-full", t.published ? "bg-vector" : "bg-ink/30")} />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`حذف ${t.name}`} onClick={() => setDeleting(t)} className="size-9 rounded-lg text-coral/80 hover:bg-coral/10 hover:text-coral">
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
          <TestimonialEditor
            initial={editing.mode === "edit" && editing.record ? formFromRecord(editing.record) : EMPTY_FORM}
            saving={saving}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Dialog>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl bg-canvas">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="font-extrabold text-ink">
              حذف رأي «{deleting?.name}» نهائيًا؟
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-7 text-ink/60">
              سيُزال من الموقع فورًا ولا يمكن التراجع. للإخفاء المؤقت استخدم زر النشر/الإخفاء.
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
