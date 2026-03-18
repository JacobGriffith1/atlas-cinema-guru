import { ok, badRequest, unauthorized } from "@/lib/http";
import { getUserIdOrNull } from "@/lib/auth";
import { query } from "@/lib/db";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";

export async function GET(req: Request) {
  const userId = await getUserIdOrNull();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const page = parsePage(url.searchParams.get("page"));
  if (page < 1) return badRequest("Invalid page");

  const totalRows = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM activities WHERE user_id = $1`,
    [userId]
  );
  const total = totalRows[0]?.total ?? 0;

  const items = await query(
    `SELECT id, type, title_id AS "titleId", created_at AS "createdAt"
     FROM activities
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    [userId]
  );

  return ok({ page, pageSize: PAGE_SIZE, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), items });
}
