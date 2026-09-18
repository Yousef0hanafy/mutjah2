"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Building2,
  Compass,
  Database,
  Globe,
  Loader2,
  MessageCircle,
  UserRound,
  Workflow,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { AudienceType, NeedType } from "@/lib/i18n/dictionary";
import { useLeadPrefill } from "@/store/lead-prefill";
import { siteConfig } from "@/lib/site-config";
import type { ContactInfo } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Point, Reveal, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

const NEED_ICONS: Record<NeedType, React.ElementType> = {
  website: Globe,
  product: AppWindow,
  system: Database,
  automation: Workflow,
  support: Wrench,
  unsure: Compass,
};

const INITIAL = {
  name: "",
  email: "",
  phone: "",
  company: "",
  scope: "",
  message: "",
  website: "", // honeypot
};

export function ContactWizard({ contact }: { contact?: ContactInfo }) {
  const { t, locale, dir } = useLanguage();
  const reduce = useReducedMotion();
  const prefillAudience = useLeadPrefill((s) => s.audience);
  const prefillNeed = useLeadPrefill((s) => s.need);
  const prefillNonce = useLeadPrefill((s) => s.nonce);

  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<AudienceType | null>(null);
  const [need, setNeed] = useState<NeedType | null>(null);
  const [fields, setFields] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Audience-path CTAs pre-fill the wizard and jump to the need step
  useEffect(() => {
    if (prefillNonce === 0) return;
    if (prefillAudience) setAudience(prefillAudience);
    if (prefillNeed) setNeed(prefillNeed);
    setStep((s) => (s === 3 ? 0 : Math.max(s, 1)));
    setErrors({});
    setBanner(null);
  }, [prefillNonce, prefillAudience, prefillNeed]);

  const setField = (key: keyof typeof INITIAL, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 0 && !audience) next.audience = t.contact.errors.chooseOption;
    if (s === 1 && !need) next.need = t.contact.errors.chooseNeed;
    if (s === 2) {
      if (fields.name.trim().length < 2) next.name = t.contact.errors.name;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim());
      if (fields.email.trim() && !emailOk) next.email = t.contact.errors.email;
      if (!fields.email.trim() && !fields.phone.trim())
        next.contact = t.contact.errors.contact;
      if (fields.message.trim().length < 10) next.message = t.contact.errors.message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!validateStep(2)) return;
    setSending(true);
    setBanner(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim() || null,
          phone: fields.phone.trim() || null,
          company: fields.company.trim() || null,
          scope: fields.scope || null,
          message: fields.message.trim(),
          audienceType: audience,
          needType: need,
          locale,
          website: fields.website,
        }),
      });
      if (res.ok) {
        setStep(3);
      } else if (res.status === 429) {
        setBanner(t.contact.errors.rateLimited);
      } else {
        setBanner(t.contact.errors.generic);
      }
    } catch {
      setBanner(t.contact.errors.generic);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAudience(null);
    setNeed(null);
    setFields(INITIAL);
    setErrors({});
    setBanner(null);
  };

  const slide = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: dir === "rtl" ? -24 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: dir === "rtl" ? 24 : -24 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  };

  const Forward = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-canvas-soft">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-28">
        {/* Left: pitch */}
        <div className="lg:col-span-5">
          <SectionHeading
            label={t.contact.label}
            heading={t.contact.heading}
            sub={t.contact.sub}
          />
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-3">
            {[
              t.contact.privacy,
              t.audience.business.msg1,
            ].map((line, i) => (
              <p
                key={i}
                className="flex items-start gap-3 text-sm leading-7 text-ink/60"
              >
                <Point className="mt-2" />
                {line}
              </p>
            ))}
            {((contact?.whatsapp ?? siteConfig.whatsapp) || (contact?.email ?? siteConfig.email)) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {(contact?.whatsapp ?? siteConfig.whatsapp) && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl border-ink/15 bg-white hover:border-vector hover:text-vector"
                  >
                    <a
                      href={`https://wa.me/${contact?.whatsapp ?? siteConfig.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" aria-hidden />
                      {t.whatsapp.label}
                    </a>
                  </Button>
                )}
                {(contact?.email ?? siteConfig.email) && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl border-ink/15 bg-white hover:border-vector hover:text-vector"
                  >
                    <a href={`mailto:${contact?.email ?? siteConfig.email}`}>{contact?.email ?? siteConfig.email}</a>
                  </Button>
                )}
              </div>
            )}
          </Reveal>
        </div>

        {/* Right: wizard */}
        <Reveal delay={0.12} className="lg:col-span-7">
          <div className="rounded-3xl border border-sandline bg-white p-6 shadow-sm sm:p-8">
            {/* Route progress */}
            {step < 3 ? (
              <div className="mb-8" aria-hidden>
                <div className="relative flex justify-between">
                  <span className="absolute end-2 start-2 top-[6px] h-0.5 bg-ink/10" />
                  <motion.span
                    className="absolute start-2 top-[6px] h-0.5 bg-vector"
                    initial={false}
                    animate={{ width: `calc(${(step / 3) * 100}% - 16px + ${(step / 3) * 16}px)` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ maxWidth: "calc(100% - 16px)" }}
                  />
                  {t.contact.steps.map((label, i) => (
                    <div
                      key={label}
                      className="relative z-10 flex w-16 flex-col items-center gap-2 sm:w-20"
                    >
                      <span
                        className={cn(
                          "size-[13px] rounded-full border-2 transition-all duration-300",
                          i < step && "border-vector bg-vector",
                          i === step && "scale-125 border-vector bg-white ring-4 ring-vector/15",
                          i > step && "border-ink/20 bg-white"
                        )}
                      />
                      <span
                        className={cn(
                          "text-center text-[10px] font-bold leading-tight sm:text-[11px]",
                          i === step ? "text-vector" : i < step ? "text-ink/60" : "text-ink/35"
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              {/* ── Step 1: who ── */}
              {step === 0 && (
                <motion.div key="s0" {...slide}>
                  <h3 className="text-xl font-extrabold text-ink">
                    {t.contact.step1.title}
                  </h3>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label={t.contact.step1.title}>
                    {(["business", "founder"] as const).map((a) => {
                      const Icon = a === "business" ? Building2 : UserRound;
                      const data = a === "business" ? t.contact.step1.business : t.contact.step1.founder;
                      const selected = audience === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            setAudience(a);
                            setErrors({});
                          }}
                          className={cn(
                            "flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-start transition-all duration-200 hover:border-vector/50",
                            selected
                              ? "border-vector bg-vector-50"
                              : "border-sandline bg-canvas-soft"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-11 items-center justify-center rounded-xl transition-colors",
                              selected ? "bg-vector text-white" : "bg-mist text-ink"
                            )}
                          >
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span className="font-bold text-ink">{data.title}</span>
                          <span className="text-sm leading-7 text-ink/60">{data.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.audience && (
                    <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
                      {errors.audience}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Step 2: need ── */}
              {step === 1 && (
                <motion.div key="s1" {...slide}>
                  <h3 className="text-xl font-extrabold text-ink">
                    {t.contact.step2.title}
                  </h3>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t.contact.step2.title}>
                    {t.contact.step2.options.map((opt) => {
                      const Icon = NEED_ICONS[opt.id as NeedType];
                      const selected = need === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            setNeed(opt.id as NeedType);
                            setErrors({});
                          }}
                          className={cn(
                            "flex items-start gap-3 rounded-2xl border-2 p-4 text-start transition-all duration-200 hover:border-vector/50",
                            selected
                              ? "border-vector bg-vector-50"
                              : "border-sandline bg-canvas-soft"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                              selected ? "bg-vector text-white" : "bg-mist text-ink"
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span>
                            <span className="block font-bold leading-snug text-ink">
                              {opt.title}
                            </span>
                            <span className="mt-1 block text-xs leading-6 text-ink/55">
                              {opt.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.need && (
                    <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
                      {errors.need}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Step 3: details ── */}
              {step === 2 && (
                <motion.div key="s2" {...slide}>
                  <h3 className="text-xl font-extrabold text-ink">
                    {t.contact.step3.title}
                  </h3>
                  <div className="mt-6 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lead-name">{t.contact.step3.name} *</Label>
                        <Input
                          id="lead-name"
                          value={fields.name}
                          onChange={(e) => setField("name", e.target.value)}
                          placeholder={t.contact.step3.namePh}
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && <FieldError msg={errors.name} />}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lead-company">
                          {t.contact.step3.company}
                        </Label>
                        <Input
                          id="lead-company"
                          value={fields.company}
                          onChange={(e) => setField("company", e.target.value)}
                          placeholder={t.contact.step3.companyPh}
                          autoComplete="organization"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lead-email">{t.contact.step3.email}</Label>
                        <Input
                          id="lead-email"
                          type="email"
                          inputMode="email"
                          dir="ltr"
                          value={fields.email}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder={t.contact.step3.emailPh}
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          className="text-start"
                        />
                        {errors.email && <FieldError msg={errors.email} />}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lead-phone">{t.contact.step3.phone}</Label>
                        <Input
                          id="lead-phone"
                          type="tel"
                          inputMode="tel"
                          dir="ltr"
                          value={fields.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          placeholder={t.contact.step3.phonePh}
                          autoComplete="tel"
                          className="text-start"
                        />
                      </div>
                    </div>
                    {(errors.contact || (fields.email || fields.phone) === "") && errors.contact && (
                      <FieldError msg={errors.contact} />
                    )}

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lead-scope">{t.contact.step3.scope}</Label>
                      <Select
                        value={fields.scope || ""}
                        onValueChange={(v) => setField("scope", v)}
                      >
                        <SelectTrigger id="lead-scope" className="h-11 w-full">
                          <SelectValue placeholder={t.contact.step3.optional} />
                        </SelectTrigger>
                        <SelectContent>
                          {t.contact.step3.scopes.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="lead-message">{t.contact.step3.message} *</Label>
                      <Textarea
                        id="lead-message"
                        rows={4}
                        value={fields.message}
                        onChange={(e) => setField("message", e.target.value)}
                        placeholder={t.contact.step3.messagePh}
                        aria-invalid={!!errors.message}
                        className="resize-none"
                      />
                      {errors.message && <FieldError msg={errors.message} />}
                    </div>

                    {/* Honeypot — invisible to humans */}
                    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
                      <label htmlFor="lead-website">Website</label>
                      <input
                        id="lead-website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={fields.website}
                        onChange={(e) => setField("website", e.target.value)}
                      />
                    </div>

                    <p className="text-xs leading-6 text-ink/45">
                      {t.contact.step3.contactHint}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: success ── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  {...slide}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <span className="relative flex size-20 items-center justify-center">
                    <span aria-hidden className="absolute inset-0 rounded-full bg-coral/15" />
                    <span aria-hidden className="absolute inset-3 rounded-full bg-coral/25" />
                    <span aria-hidden className="relative size-5 rounded-full bg-coral" />
                  </span>
                  <h3 className="mt-7 text-2xl font-extrabold text-ink">
                    {t.contact.success.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[15px] leading-8 text-ink/60">
                    {t.contact.success.desc}
                  </p>
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="mt-8 h-11 rounded-xl border-ink/15 hover:border-vector hover:text-vector"
                  >
                    {t.contact.success.again}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            {banner && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
              >
                {banner}
              </p>
            )}

            {/* Nav buttons */}
            {step < 3 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-sandline pt-6">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => s - 1)}
                    className="h-11 rounded-xl px-5 text-ink/60 hover:text-ink"
                  >
                    <Back className="size-4" aria-hidden />
                    {t.contact.back}
                  </Button>
                ) : (
                  <span />
                )}
                {step < 2 ? (
                  <Button
                    onClick={goNext}
                    className="h-11 rounded-xl bg-ink px-7 font-semibold text-canvas hover:bg-vector"
                  >
                    {t.contact.next}
                    <Forward className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    disabled={sending}
                    className="h-11 rounded-xl bg-ink px-7 font-semibold text-canvas hover:bg-vector disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {t.contact.sending}
                      </>
                    ) : (
                      <>
                        {t.contact.submit}
                        <Forward className="size-4" aria-hidden />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {step < 3 && (
              <p className="mt-4 text-xs leading-6 text-ink/40">{t.contact.privacy}</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p role="alert" className="text-xs font-semibold text-destructive">
      {msg}
    </p>
  );
}
