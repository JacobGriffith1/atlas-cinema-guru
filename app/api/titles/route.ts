import { ok, badRequest } from "@/lib/http";
import { query } from "@/lib/db";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { getUserIdOrNull } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseYear(value: string | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}

function parseGenres(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const page = parsePage(url.searchParams.get("page"));
    const minYear = parseYear(url.searchParams.get("minYear"));
    const maxYear = parseYear(url.searchParams.get("maxYear"));
    const genres = parseGenres(url.searchParams.get("genres"));
    const search = (url.searchParams.get("search") ?? "").trim();

    if (minYear !== null && maxYear !== null && minYear > maxYear) {
      return badRequest("minYear cannot be greater than maxYear");
    }

    const userId = await getUserIdOrNull(); // nullable

    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (minYear !== null) {
      where.push(`t.year >= $${i++}`);
      params.push(minYear);
    }
    if (maxYear !== null) {
      where.push(`t.year <= $${i++}`);
      params.push(maxYear);
    }
    if (genres.length > 0) {
      where.push(`t.genres && $${i++}::text[]`);
      params.push(genres);
    }
    if (search.length > 0) {
      where.push(`t.name ILIKE $${i++}`);
      params.push(`%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRows = await query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM titles t ${whereSql}`,
      params
    );
    const total = totalRows[0]?.total ?? 0;

    const offset = (page - 1) * PAGE_SIZE;

    if (!userId) {
      const items = await query(
        `
        SELECT
          t.id,
          t.name,
          t.description,
          t.year,
          t.genres,
          t.poster_url AS "posterUrl",
          FALSE AS "isFavorite",
          FALSE AS "isWatchLater"
        FROM titles t
        ${whereSql}
        ORDER BY t.year DESC, t.name ASC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
        `,
        params
      );

      return ok({
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        items,
      });
    }

    // user-aware: add favorite/watch later flags via LEFT JOIN
    const items = await query(
      `
      SELECT
        t.id,
        t.name,
        t.description,
        t.year,
        t.genres,
        t.poster_url AS "posterUrl",
        (f.user_id IS NOT NULL) AS "isFavorite",
        (w.user_id IS NOT NULL) AS "isWatchLater"
      FROM titles t
      LEFT JOIN favorites f
        ON f.title_id = t.id AND f.user_id = $${i}
      LEFT JOIN watch_later w
        ON w.title_id = t.id AND w.user_id = $${i}
      ${whereSql}
      ORDER BY t.year DESC, t.name ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `,
      [...params, userId]
    );

    return ok({
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      items,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return badRequest(`Titles failed: ${message}`);
  }
}
