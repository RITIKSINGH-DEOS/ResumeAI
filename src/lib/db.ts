import postgres from "postgres";

/**
 * Direct PostgreSQL access (Supabase). Use only in Server Components, Route Handlers,
 * or Server Actions — never import in client components.
 *
 * Requires `DATABASE_URL` (Settings → Database → Connection string → URI).
 */
const url = process.env.DATABASE_URL;

export const sql = url
  ? postgres(url, {
      ssl: "require",
      max: 1,
    })
  : null;

export function getSql() {
  if (!sql) {
    throw new Error("DATABASE_URL is not set");
  }
  return sql;
}

export function isDbConfigured(): boolean {
  return Boolean(url);
}
