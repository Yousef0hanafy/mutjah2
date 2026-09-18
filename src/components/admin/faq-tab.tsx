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
import { BilingualPair, PublishedSwitch } from "./ui";

type FaqRecord = {
  id: string;
  order: number;
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
  published: boolean;
};

type FormState = { qAr: string; qEn: string; aAr: string; aEn: string; published: boolean };
const EMPTY: FormState = { qAr: "", qEn: "", aAr: "", aEn: "", published: true };

function FaqEditor({
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
  const valid = form.qAr.trim() && form.qEn.trim() && form.aAr.trim().length >= 10 && form.aEn.trim().length >= 10;

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-canvas">
      <DialogHeader className="text-start">
        <DialogTitle className="text-lg font-extrabold text-ink">سؤال شائع</DialogTitle>
        <DialogDescription className="text-sm text-ink/50">
          السؤال والجواب باللغتين — يظهر في قسم الأسئلة وفي نتائج البحث (FAQ Schema).
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <BilingualPair
          labelAr="السؤال (عربي)"
          labelEn="Question (English)"
          valueAr={form.qAr}
          valueEn={form.qEn}
          onChangeAr={(v) => set("qAr", v)}
          onChangeEn={(v) => set("qEn", v)}
        />
        <BilingualPair
          labelAr="الجواب (عربي)"
          labelEn="Answer (English)"
          valueAr={form.aAr}
          valueEn={form.aEn}
          onChangeAr={(v) => set("aAr", v)}
          onChangeEn={(v) => set("aEn", v)}
          multiline
          rows={4}
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

export function FaqTab() {
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<{ mode: "create" | "edit"; record: FaqRecord | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<FaqRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/faqs", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFaqs(data.faqs);
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
        qAr: form.qAr.trim(),
        qEn: form.qEn.trim(),
        aAr: form.aAr.trim(),
        aEn: form.aEn.trim(),
        published: form.published,
      };
      const res =
        editing.mode === "create"
          ? await fetch("/api/admin/faqs", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/faqs/${editing.record!.id}`, {
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
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    [next[index], next[target]] = [next[target], next[index]];
    setFaqs(next);
    await fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((f, i) => ({ id: f.id, order: i })) }),
    });
  }

  const sorted = useMemo(() => [...faqs].sort((a, b) => a.order - b.order), [faqs]);

  if (loading) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink/5" />)}</div>;
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
        <p className="text-sm text-ink/55">{sorted.length} سؤال — الترتيب هنا هو الترتيب المعروض على الموقع</p>
        <Button size="sm" onClick={() => setEditing({ mode: "create", record: null })} className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector">
          <Plus className="size-4" aria-hidden />
          سؤال جديد
        </Button>
      </div>

      <ul className="space-y-3">
        {sorted.map((f, i) => (
          <li key={f.id}>
            <Card className={cn("border-ink/10 transition-opacity", !f.published && "opacity-60")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-extrabold text-ink">{f.qAr}</h3>
                    {!f.published && <Badge className="rounded-full bg-coral/15 text-[11px] text-coral">مسودة</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/55">{f.aAr}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" aria-label={`تقديم ${f.qAr}`} disabled={i === 0} onClick={() => move(i, -1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تأخير ${f.qAr}`} disabled={i === sorted.length - 1} onClick={() => move(i, 1)} className="size-9 rounded-lg text-ink/50 hover:bg-ink/5">
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`تعديل ${f.qAr}`} onClick={() => setEditing({ mode: "edit", record: f })} className="size-9 rounded-lg text-ink/60 hover:bg-ink/5">
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`نشر/إخفاء ${f.qAr}`}
                    disabled={busyId === f.id}
                    onClick={async () => {
                      setBusyId(f.id);
                      try {
                        await fetch(`/api/admin/faqs/${f.id}`, {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ published: !f.published }),
                        });
                        await load();
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    className={cn("size-9 rounded-lg", f.published ? "text-vector hover:bg-vector/10" : "text-ink/40 hover:bg-ink/5")}
                  >
                    <span className={cn("size-2.5 rounded-full", f.published ? "bg-vector" : "bg-ink/30")} />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`حذف ${f.qAr}`} onClick={() => setDeleting(f)} className="size-9 rounded-lg text-coral/80 hover:bg-coral/10 hover:text-coral">
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
          <FaqEditor
            initial={editing.mode === "edit" && editing.record ? { ...editing.record } : EMPTY}
            saving={saving}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Dialog>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl bg-canvas">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="font-extrabold text-ink">حذف السؤال نهائيًا؟</AlertDialogTitle>
            <AlertDialogDescription className="leading-7 text-ink/60">
              «{deleting?.qAr}» سيُزال من الموقع فورًا ولا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-xl border-ink/15">تراجع</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting) return;
                setBusyId(deleting.id);
                try {
                  await fetch(`/api/admin/faqs/${deleting.id}`, { method: "DELETE" });
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
