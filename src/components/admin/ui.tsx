"use client";

/** Shared bilingual form primitives for the MUTJAH admin panel. */

import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function FieldWrap({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] font-bold text-ink/80">
        {label}
        {hint && <span className="ms-2 text-[11px] font-semibold text-ink/40">{hint}</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  ltr,
  required,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ltr?: boolean;
  required?: boolean;
  type?: string;
}) {
  const id = `f-${label.replace(/\s/g, "-")}`;
  return (
    <FieldWrap label={label} hint={hint} htmlFor={id}>
      <Input
        id={id}
        type={type}
        required={required}
        dir={ltr ? "ltr" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-10 rounded-xl border-ink/15 bg-white", ltr && "text-left")}
      />
    </FieldWrap>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  ltr,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  ltr?: boolean;
}) {
  const id = `f-${label.replace(/\s/g, "-")}`;
  return (
    <FieldWrap label={label} hint={hint} htmlFor={id}>
      <Textarea
        id={id}
        dir={ltr ? "ltr" : undefined}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={cn("rounded-xl border-ink/15 bg-white", ltr && "text-left")}
      />
    </FieldWrap>
  );
}

/** Bilingual pair: Arabic field on the right, English field on the left. */
export function BilingualPair({
  labelAr,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  multiline,
  rows = 3,
}: {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  if (multiline) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <TextAreaField label={labelAr} value={valueAr} onChange={onChangeAr} rows={rows} />
        <TextAreaField label={labelEn} value={valueEn} onChange={onChangeEn} rows={rows} ltr />
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField label={labelAr} value={valueAr} onChange={onChangeAr} />
      <TextField label={labelEn} value={valueEn} onChange={onChangeEn} ltr />
    </div>
  );
}

export function PublishedSwitch({
  published,
  onChange,
}: {
  published: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
      <div>
        <Label className="text-[13px] font-bold text-ink/80">منشور على الموقع</Label>
        <p className="mt-0.5 text-xs text-ink/45">أوقفه لإخفاء العنصر دون حذفه (مسودة)</p>
      </div>
      <Switch checked={published} onCheckedChange={onChange} />
    </div>
  );
}

/** Image upload with preview — uploads to /api/admin/upload (WebP). */
export function ImageUploadField({
  label,
  path,
  type = "cover",
  onChange,
}: {
  label: string;
  path: string | null;
  type?: "cover" | "avatar";
  onChange: (path: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.ok) {
        onChange(data.path as string);
      } else if (data.error === "too_large") {
        setError("الصورة أكبر من 6MB");
      } else if (data.error === "bad_type") {
        setError("صيغة غير مدعومة — استخدم PNG أو JPG أو WebP أو AVIF");
      } else if (data.error === "invalid_image") {
        setError("الملف تالف أو غير صالح كصورة");
      } else if (data.error === "blob_token_missing") {
        setError("خدمة تخزين الصور السحابية (Blob) غير مهيأة في بيئة الإنتاج");
      } else {
        setError("تعذر رفع الصورة، أعد المحاولة");
      }
    } catch {
      setError("تعذر الاتصال بالخادم لرفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldWrap label={label}>
      <div className="flex items-start gap-3">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-mist-50">
          {path ? (
                      <img src={path} alt="معاينة" className="size-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-ink/30">لا صورة</span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
              <Loader2 className="size-6 animate-spin text-white" aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="h-9 rounded-xl border-ink/15"
            >
              <Upload className="size-4" aria-hidden />
              {uploading ? "جارٍ الرفع…" : path ? "تغيير الصورة" : "رفع صورة"}
            </Button>
            {path && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(null)}
                className="h-9 rounded-xl text-coral hover:bg-coral/10 hover:text-coral"
              >
                إزالة
              </Button>
            )}
          </div>
          {error && <p className="text-xs font-bold text-coral">{error}</p>}
          <p className="text-[11px] leading-5 text-ink/40">PNG / JPG / WebP حتى 6MB — تُحوَّل تلقائيًا إلى WebP مُحسَّن.</p>
        </div>
      </div>
    </FieldWrap>
  );
}
