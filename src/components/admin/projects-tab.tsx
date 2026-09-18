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

/* ── Types ────────────────────────────────────────────────────────────────── */

type ProjectRecord = {
  id: string;
  order: number;
  name: string;
  status: string;
  langs: string;
  headlineAr: string;
  headlineEn: string;
  descAr: string;
  descEn: string;
  tagsAr: string;
  tagsEn: string;
  url: string | null;
  coverPath: string | null;
  published: boolean;
};

type FormState = {
  name: string;
  status: "live" | "deployed" | "mvp";
  langsAr: boolean;
  langsEn: boolean;
  headlineAr: string;
  headlineEn: string;
  descAr: string;
  descEn: string;
  tagsAr: string;
  tagsEn: string;
  url: string;
  coverPath: string | null;
  published: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  live: "منصة حية",
  deployed: "منتج منشور",
  mvp: "نموذج MVP",
};

const STATUS_COLORS: Record<string, string> = {
  live: "bg-vector/15 text-vector",
  deployed: "bg-ink/10 text-ink",
  mvp: "bg-coral/15 text-coral",
};

const EMPTY_FORM: FormState = {
  name: "",
  status: "deployed",
  langsAr: true,
  langsEn: true,
  headlineAr: "",
  headlineEn: "",
  descAr: "",
  descEn: "",
  tagsAr: "",
  tagsEn: "",
  url: "",
  coverPath: null,
  published: true,
};

function formFromRecord(p: ProjectRecord): FormState {
  let langs: string[] = ["ar", "en"];
  let tagsAr: string[] = [];
  let tagsEn: string[] = [];
  try {
    langs = JSON.parse(p.langs);
    tagsAr = JSON.parse(p.tagsAr);
    tagsEn = JSON.parse(p.tagsEn);
  } catch {
    /* keep defaults */
  }
  return {
    name: p.name,
    status: (p.status as FormState["status"]) ?? "deployed",
    langsAr: langs.includes("ar"),
    langsEn: langs.includes("en"),
    headlineAr: p.headlineAr,
    headlineEn: p.headlineEn,
    descAr: p.descAr,
    descEn: p.descEn,
    tagsAr: tagsAr.join("، "),
    tagsEn: tagsEn.join(", "),
    url: p.url ?? "",
    coverPath: p.coverPath,
    published: p.published,
  };
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}

/* ── Editor dialog ────────────────────────────────────────────────────────── */

function ProjectEditor({
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

  const valid =
    form.name.trim() &&
    form.headlineAr.trim() &&
    form.headlineEn.trim() &&
    form.descAr.trim() &&
    form.descEn.trim() &&
    (form.langsAr || form.langsEn);

  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-canvas">
      <DialogHeader className="text-start">
        <DialogTitle className="text-lg font-extrabold text-ink">بيانات المشروع</DialogTitle>
        <DialogDescription className="text-sm text-ink/50">
          املأ الحقلين بالعربية والإنجليزية — الموقع يعرض اللغة حسب زائر اللغة.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="اسم المشروع" value={form.name} onChange={(v) => set("name", v)} required />
          <div>
            <label className="text-[13px] font-bold text-ink/80" htmlFor="p-status">
              الحالة
            </label>
            <select
              id="p-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as FormState["status"])}
              className="mt-1.5 h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm font-semibold text-ink"
            >
              <option value="live">منصة حية</option>
              <option value="deployed">منتج منشور</option>
              <option value="mvp">نموذج MVP</option>
            </select>
          </div>
          <TextField
            label="رابط المشروع"
            hint="اختياري"
            value={form.url}
            onChange={(v) => set("url", v)}
            ltr
            placeholder="https://…"
          />
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white px-4 py-3">
          <span className="text-[13px] font-bold text-ink/80">لغات المشروع</span>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <input
              type="checkbox"
              checked={form.langsAr}
              onChange={(e) => set("langsAr", e.target.checked)}
              className="size-4 accent-[#315BFF]"
            />
            عربي
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <input
              type="checkbox"
              checked={form.langsEn}
              onChange={(e) => set("langsEn", e.target.checked)}
              className="size-4 accent-[#315BFF]"
            />
            English
          </label>
          {!form.langsAr && !form.langsEn && (
            <span className="text-xs font-bold text-coral">اختر لغة واحدة على الأقل</span>
          )}
        </div>

        <BilingualPair
          labelAr="العنوان الفرعي (عربي)"
          labelEn="Subtitle (English)"
          valueAr={form.headlineAr}
          valueEn={form.headlineEn}
          onChangeAr={(v) => set("headlineAr", v)}
          onChangeEn={(v) => set("headlineEn", v)}
        />

        <BilingualPair
          labelAr="الوصف (عربي)"
          labelEn="Description (English)"
          valueAr={form.descAr}
          valueEn={form.descEn}
          onChangeAr={(v) => set("descAr", v)}
          onChangeEn={(v) => set("descEn", v)}
          multiline
          rows={4}
        />

        <BilingualPair
          labelAr="الوسوم (عربي) — افصل بفاصلة"
          labelEn="Tags (English) — comma separated"
          valueAr={form.tagsAr}
          valueEn={form.tagsEn}
          onChangeAr={(v) => set("tagsAr", v)}
          onChangeEn={(v) => set("tagsEn", v)}
        />

        <ImageUploadField
          label="غلاف المشروع"
          path={form.coverPath}
          onChange={(p) => set("coverPath", p)}
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

/* ── Tab ──────────────────────────────────────────────────────────────────── */

export function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<{ mode: "create" | "edit"; record: ProjectRecord | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ProjectRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects);
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
        status: form.status,
        langs: [form.langsAr && "ar", form.langsEn && "en"].filter(Boolean),
        headlineAr: form.headlineAr.trim(),
        headlineEn: form.headlineEn.trim(),
        descAr: form.descAr.trim(),
        descEn: form.descEn.trim(),
        tagsAr: parseTags(form.tagsAr),
        tagsEn: parseTags(form.tagsEn),
        url: form.url.trim() || null,
        coverPath: form.coverPath,
        published: form.published,
      };
      const res =
        editing.mode === "create"
          ? await fetch("/api/admin/projects", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/projects/${editing.record!.id}`, {
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

  async function remove(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublished(p: ProjectRecord) {
    setBusyId(p.id);
    try {
      await fetch(`/api/admin/projects/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next.map((p, i) => ({ id: p.id, order: i })) }),
    });
  }

  const sorted = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
          {sorted.length} مشروع — القسم الأول في الموقع يعرضها بالترتيب التالي
        </p>
        <Button
          size="sm"
          onClick={() => setEditing({ mode: "create", record: null })}
          className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector"
        >
          <Plus className="size-4" aria-hidden />
          مشروع جديد
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/50 text-sm font-semibold text-ink/40">
          لا مشاريع بعد — أضف أول مشروع
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((p, i) => (
          <li key={p.id}>
            <Card className={cn("border-ink/10 transition-opacity", !p.published && "opacity-60")}>
              <CardContent className="flex items-center gap-4 p-4">
                {/* Cover thumb */}
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-mist-50">
                  {p.coverPath ? (
                    <img src={p.coverPath} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[10px] font-bold text-ink/25">بدون غلاف</span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-extrabold text-ink">{p.name}</h3>
                    <Badge variant="outline" className={cn("rounded-full border-0 text-[11px]", STATUS_COLORS[p.status])}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                    {!p.published && (
                      <Badge className="rounded-full bg-coral/15 text-[11px] text-coral">مسودة</Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/55">{p.headlineAr}</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`تقديم ${p.name}`}
                    disabled={i === 0 || busyId === p.id}
                    onClick={() => move(i, -1)}
                    className="size-9 rounded-lg text-ink/50 hover:bg-ink/5"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`تأخير ${p.name}`}
                    disabled={i === sorted.length - 1 || busyId === p.id}
                    onClick={() => move(i, 1)}
                    className="size-9 rounded-lg text-ink/50 hover:bg-ink/5"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`تعديل ${p.name}`}
                    onClick={() => setEditing({ mode: "edit", record: p })}
                    className="size-9 rounded-lg text-ink/60 hover:bg-ink/5"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`نشر/إخفاء ${p.name}`}
                    disabled={busyId === p.id}
                    onClick={() => togglePublished(p)}
                    className={cn(
                      "size-9 rounded-lg",
                      p.published ? "text-vector hover:bg-vector/10" : "text-ink/40 hover:bg-ink/5"
                    )}
                    title={p.published ? "إخفاء من الموقع" : "نشر على الموقع"}
                  >
                    <span className={cn("size-2.5 rounded-full", p.published ? "bg-vector" : "bg-ink/30")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`حذف ${p.name}`}
                    onClick={() => setDeleting(p)}
                    className="size-9 rounded-lg text-coral/80 hover:bg-coral/10 hover:text-coral"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {/* Editor dialog */}
      {editing && (
        <Dialog open onOpenChange={(open) => !open && setEditing(null)}>
          <ProjectEditor
            initial={editing.mode === "edit" && editing.record ? formFromRecord(editing.record) : EMPTY_FORM}
            saving={saving}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Dialog>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl bg-canvas">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="font-extrabold text-ink">
              حذف «{deleting?.name}» نهائيًا؟
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-7 text-ink/60">
              سيُزال المشروع من الموقع فورًا ولا يمكن التراجع. إن أردت إخفاءه مؤقتًا استخدم زر النشر/الإخفاء بدلًا من الحذف.
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
