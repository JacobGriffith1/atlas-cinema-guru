import { ok, badRequest } from "@/lib/http";
import { query } from "@/lib/db";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";

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
  const url = new URL(req.url);

  const page = parsePage(url.searchParams.get("page"));
  const minYear = parseYear(url.searchParams.get("minYear"));
  const maxYear = parseYear(url.searchParams.get("maxYear"));
  const genres = parseGenres(url.searchParams.get("genres"));

  if (minYear !== null && maxYear !== null && minYear > maxYear) {
    return badRequest("minYear cannot be greater than maxYear");
  }

  const where: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (minYear !== null) {
    where.push(`year >= $${i++}`);
    params.push(minYear);
  }
  if (maxYear !== null) {
    where.push(`year <= $${i++}`);
    params.push(maxYear);
  }
  if (genres.length > 0) {
    where.push(`genres && $${i++}::text[]`);
    params.push(genres);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRows = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM titles ${whereSql}`,
    params
  );
  const total = totalRows[0]?.total ?? 0;

  const items = await query(
    `SELECT id, name, year, genres, poster_url AS "posterUrl"
     FROM titles
     ${whereSql}
     ORDER BY year DESC, name ASC
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    params
  );

  return ok({
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    items
  });
}
