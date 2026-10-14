/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dictionaries } from "@/lib/i18n/dictionary";
import { seoCopy } from "@/lib/seo";

/** Collect every string in a nested object/array. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

/** Same keys, same array lengths, same value types in both languages. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

const publicCopy = () => [
  ...strings(dictionaries),
  ...strings(seoCopy),
  readFileSync("public/llms.txt", "utf8"),
];

describe("bilingual dictionary", () => {
  test("ar and en have identical structure", () => {
    expect(shape(dictionaries.en)).toEqual(shape(dictionaries.ar));
  });

  test("no empty strings", () => {
    for (const locale of ["ar", "en"] as const) {
      expect(strings(dictionaries[locale]).filter((s) => s.trim() === "")).toEqual([]);
    }
  });
});

describe("brand content policy (see CLAUDE.md)", () => {
  test("does not name target countries or the Arab world in public copy", () => {
    const banned = /Egypt|Saudi|مصر|السعودية|العالم العربي|Arab world/i;
    expect(publicCopy().filter((s) => banned.test(s))).toEqual([]);
  });

  test("shows no prices or currencies", () => {
    const priceLike = /\b(USD|EGP|SAR)\b|ريال|جنيه|ج\.م|[$€£]\s*\d|\d\s*[$€£]|(starting (at|from)|يبدأ من|تبدأ من|ابتداءً? من)\s*[\d$]/i;
    expect(publicCopy().filter((s) => priceLike.test(s))).toEqual([]);
  });

  test("copy addresses individuals as well as companies", () => {
    const text = (l: "ar" | "en") => strings(dictionaries[l].faq).join(" ");
    expect(text("ar")).toContain("الأفراد");
    expect(text("en").toLowerCase()).toContain("individuals");
  });
});
