import { ok, badRequest, unauthorized, notFound } from "@/lib/http";
import { getUserIdOrNull } from "@/lib/auth";
import { query } from "@/lib/db";

async function logActivity(userId: string, type: string, titleId: string) {
  const id = `a_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  await query(
    `INSERT INTO activities (id, user_id, type, title_id) VALUES ($1, $2, $3, $4)`,
    [id, userId, type, titleId]
  );
}

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const userId = await getUserIdOrNull();
  if (!userId) return unauthorized();

  const titleId = ctx.params.id;
  const exists = await query(`SELECT 1 FROM titles WHERE id = $1`, [titleId]);
  if (exists.length === 0) return notFound("Title not found");

  try {
    await query(`INSERT INTO watch_later (user_id, title_id) VALUES ($1, $2)`, [userId, titleId]);
    await logActivity(userId, "WATCH_LATER_ADD", titleId);
    return ok({ added: true });
  } catch {
    return badRequest("Already in watch later");
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const userId = await getUserIdOrNull();
  if (!userId) return unauthorized();

  const titleId = ctx.params.id;
  const res = await query(`DELETE FROM watch_later WHERE user_id = $1 AND title_id = $2 RETURNING 1`, [
    userId,
    titleId
  ]);
  if (res.length === 0) return notFound("Not in watch later");

  await logActivity(userId, "WATCH_LATER_REMOVE", titleId);
  return ok({ removed: true });
}
