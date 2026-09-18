"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "./ui";

type Settings = {
  contact_email: string;
  contact_whatsapp: string;
  social_linkedin: string;
  social_facebook: string;
  social_instagram: string;
};

const EMPTY: Settings = {
  contact_email: "",
  contact_whatsapp: "",
  social_linkedin: "",
  social_facebook: "",
  social_instagram: "",
};

export function SettingsTab() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...EMPTY, ...data.settings });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      setMessage(res.ok ? "تم الحفظ ✓ — يظهر على الموقع بعد التحديث التالي للصفحة" : "تعذر الحفظ — تحقق من صحة القيم");
    } catch {
      setMessage("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPwSaving(true);
    setPwMessage(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPwMessage("تم تغيير كلمة المرور ✓");
        setCurrentPw("");
        setNewPw("");
      } else if (data.error === "wrong_password") {
        setPwMessage("كلمة المرور الحالية غير صحيحة");
      } else {
        setPwMessage("كلمة المرور الجديدة: ١٠ أحرف على الأقل وتحتوي حرفًا ورقمًا");
      }
    } catch {
      setPwMessage("تعذر الاتصال بالخادم");
    } finally {
      setPwSaving(false);
    }
  }

  const set = (k: keyof Settings, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-ink/10">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-extrabold text-ink">قنوات التواصل</h2>
            <p className="mt-1 text-sm text-ink/50">
              تُستخدم في الفوتر وزر واتساب العائم وقسم التواصل — اترك الحقل فارغًا لإخفاء القناة من الموقع.
            </p>
          </div>
          <TextField
            label="البريد الإلكتروني"
            hint="للعرض على الموقع"
            value={settings.contact_email}
            onChange={(v) => set("contact_email", v)}
            ltr
            type="email"
            placeholder="you@mutjah.com"
          />
          <TextField
            label="رقم واتساب"
            hint="بالصيغة الدولية بدون +، مثال: 201100475722"
            value={settings.contact_whatsapp}
            onChange={(v) => set("contact_whatsapp", v)}
            ltr
            placeholder="201100475722"
          />
          <TextField
            label="رابط LinkedIn"
            hint="اختياري"
            value={settings.social_linkedin}
            onChange={(v) => set("social_linkedin", v)}
            ltr
            placeholder="https://linkedin.com/company/…"
          />
          <TextField
            label="رابط Facebook"
            hint="اختياري"
            value={settings.social_facebook}
            onChange={(v) => set("social_facebook", v)}
            ltr
            placeholder="https://facebook.com/…"
          />
          <TextField
            label="رابط Instagram"
            hint="اختياري"
            value={settings.social_instagram}
            onChange={(v) => set("social_instagram", v)}
            ltr
            placeholder="https://instagram.com/…"
          />
          {message && <p className="text-sm font-bold text-vector">{message}</p>}
          <div className="flex justify-end border-t border-ink/10 pt-4">
            <Button onClick={save} disabled={saving} className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector">
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-ink/10">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <KeyRound className="size-5 text-ink/50" aria-hidden />
              تغيير كلمة المرور
            </h2>
            <p className="mt-1 text-sm text-ink/50">
              استخدم كلمة مرور قوية — ١٠ أحرف على الأقل وتحتوي حرفًا ورقمًا.
            </p>
          </div>
          <TextField label="كلمة المرور الحالية" value={currentPw} onChange={setCurrentPw} type="password" ltr />
          <TextField label="كلمة المرور الجديدة" value={newPw} onChange={setNewPw} type="password" ltr />
          {pwMessage && <p className="text-sm font-bold text-vector">{pwMessage}</p>}
          <div className="flex justify-end border-t border-ink/10 pt-4">
            <Button
              onClick={changePassword}
              disabled={pwSaving || !currentPw || newPw.length < 10}
              className="h-10 rounded-xl bg-ink font-bold text-canvas hover:bg-vector"
            >
              {pwSaving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              تغيير كلمة المرور
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
