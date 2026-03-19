import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: true,
      data: {
        skipped: true,
        message:
          "DATABASE_URL is not set in this environment. Seed skipped. Set DATABASE_URL in env vars and retry.",
      },
    });
  }

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS titles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        year INT NOT NULL,
        genres TEXT[] NOT NULL DEFAULT '{}',
        poster_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // If your DB was created before "description" existed:
    await query(`ALTER TABLE titles ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';`);

    await query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title_id TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, title_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS watch_later (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title_id TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, title_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const countRows = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM titles`
    );

    if (Number(countRows[0]?.count ?? "0") === 0) {
      const titles = [
        {
          id: "t1",
          name: "Nebula Drift",
          description: "A radio astronomer finds a pattern in deep-space noise that shouldn’t exist.",
          year: 2024,
          genres: ["Sci-Fi", "Mystery"],
        },
        {
          id: "t2",
          name: "Midnight Archive",
          description: "A librarian uncovers a missing collection that rewrites local history.",
          year: 2023,
          genres: ["Mystery", "Thriller"],
        },
        {
          id: "t3",
          name: "Aurora Protocol",
          description: "A retired pilot is pulled into a covert mission beyond the polar lights.",
          year: 2025,
          genres: ["Sci-Fi", "Action"],
        },
        {
          id: "t4",
          name: "Cedar Street",
          description: "Old neighbors confront new truths when a letter resurfaces after decades.",
          year: 2022,
          genres: ["Drama"],
        },
        {
          id: "t5",
          name: "The Last Signal",
          description: "A failing satellite sends one final transmission—and it’s addressed to you.",
          year: 2024,
          genres: ["Sci-Fi"],
        },
        {
          id: "t6",
          name: "Glass River",
          description: "A detective follows a case upstream and finds her own past waiting there.",
          year: 2026,
          genres: ["Mystery", "Drama"],
        },
      ];

      for (const t of titles) {
        await query(
          `INSERT INTO titles (id, name, description, year, genres)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [t.id, t.name, t.description, t.year, t.genres]
        );
      }
    }

    return NextResponse.json({
      ok: true,
      data: { skipped: false, message: "Seed complete." },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: { message: `Seed failed: ${message}` } },
      { status: 500 }
    );
  }
}
