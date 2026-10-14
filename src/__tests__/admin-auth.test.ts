/// <reference types="bun-types" />
import { beforeAll, describe, expect, mock, test } from "bun:test";
import { Glob } from "bun";
import { NextRequest } from "next/server";

// No session cookie, no database: every guarded admin handler must answer 401 before touching anything.
mock.module("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));
mock.module("@/lib/db", () => ({ db: new Proxy({}, { get: () => { throw new Error("db must not be touched when unauthenticated"); } }) }));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));

// Public by design: they implement login/logout/session-probe themselves.
const PUBLIC_ROUTES = new Set(["login", "logout", "session"]);
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const routeFiles = [...new Glob("src/app/api/admin/**/route.ts").scanSync(".")].sort();

describe("admin API authorization", () => {
  test("route discovery finds the admin API", () => {
    expect(routeFiles.length).toBeGreaterThan(10);
  });

  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
  });

  for (const file of routeFiles) {
    const segment = file.split("/").slice(-2, -1)[0];
    if (PUBLIC_ROUTES.has(segment)) continue;

    test(`${file} rejects unauthenticated requests`, async () => {
      const mod = await import(`../../${file}`);
      const handlers = METHODS.filter((m) => typeof mod[m] === "function");
      expect(handlers.length).toBeGreaterThan(0);
      for (const method of handlers) {
        const req = new NextRequest("http://localhost/api/admin/x", {
          method,
          ...(method === "GET" || method === "DELETE" ? {} : { body: "{}", headers: { "content-type": "application/json" } }),
        });
        const res: Response = await mod[method](req, { params: Promise.resolve({ id: "x" }) });
        expect(`${method} ${res.status}`).toBe(`${method} 401`);
      }
    });
  }
});
