import type { NextConfig } from "next";
import { readFileSync } from "node:fs";

// Guard: this sandbox historically exports DATABASE_URL (old SQLite path) into
// every shell. Shell env beats .env files, so if we detect the stale file: URL
// we self-heal by loading the project's .env value (Neon PostgreSQL).
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  try {
    const raw = readFileSync(new URL("./.env", import.meta.url), "utf8");
    const mDb = raw.match(/^DATABASE_URL="([^"]+)"/m);
    if (mDb) process.env.DATABASE_URL = mDb[1];
    if (!process.env.DIRECT_DATABASE_URL) {
      const mDirect = raw.match(/^DIRECT_DATABASE_URL="([^"]+)"/m);
      if (mDirect) process.env.DIRECT_DATABASE_URL = mDirect[1];
    }
  } catch {
    // .env unreadable — Prisma will surface a clear error instead
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Full type safety enforced — `bunx tsc --noEmit` passes with zero errors
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
