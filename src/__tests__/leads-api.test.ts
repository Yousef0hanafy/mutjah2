/// <reference types="bun-types" />
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";

const create = mock(async () => ({}));
let rateCount = 1;
mock.module("@/lib/db", () => ({
  db: {
    rateLimit: {
      findUnique: async () => ({ key: "k", count: rateCount, expiresAt: new Date(Date.now() + 60_000) }),
      upsert: async () => ({}),
      update: async () => ({ count: rateCount }),
    },
    lead: { create },
  },
}));
// `after()` needs a request scope; run the callback inline so the webhook path is exercised too.
const realServer = await import("next/server");
mock.module("next/server", () => ({ ...realServer, after: (fn: () => unknown) => void fn }));

const { POST } = await import("@/app/api/leads/route");

const valid = {
  name: "Test Person",
  email: "test@example.com",
  message: "We need a website for our small business.",
  audienceType: "business",
  needType: "website",
  locale: "en",
};

const post = (body: unknown, raw = false) =>
  POST(
    new NextRequest("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
      body: raw ? (body as string) : JSON.stringify(body),
    })
  );

beforeEach(() => {
  create.mockClear();
  rateCount = 1;
});

describe("POST /api/leads", () => {
  test("stores a valid lead", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
  });

  test("honeypot: pretends success but stores nothing", async () => {
    const res = await post({ ...valid, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(create).not.toHaveBeenCalled();
  });

  test("rejects malformed JSON and invalid payloads", async () => {
    expect((await post("{not json", true)).status).toBe(400);
    expect((await post({ ...valid, name: "A" })).status).toBe(400);
    expect((await post({ ...valid, email: "nope" })).status).toBe(400);
    expect((await post({ ...valid, message: "short" })).status).toBe(400);
    expect((await post({ ...valid, needType: "hack" })).status).toBe(400);
    expect((await post({ ...valid, audienceType: "alien" })).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  test("returns 429 once the per-IP limit is exceeded", async () => {
    rateCount = 6;
    const res = await post(valid);
    expect(res.status).toBe(429);
    expect(create).not.toHaveBeenCalled();
  });
});
