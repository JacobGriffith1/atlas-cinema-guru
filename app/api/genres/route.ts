import { ok, badRequest } from "@/lib/http";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await query<{ genre: string }>(
      `
      SELECT DISTINCT unnest(genres) AS genre
      FROM titles
      ORDER BY genre ASC
      `
    );
    return ok({ items: rows.map((r) => r.genre) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return badRequest(`Genres failed: ${message}`);
  }
}
