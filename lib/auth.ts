import { auth } from "@/auth";
import { query } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth();
  const rawEmail = session?.user?.email ?? null;
  if (!rawEmail) return null;

  const email = normalizeEmail(rawEmail);

  // Prefer email as id for newly-created users (simple), but never fight the UNIQUE(email).
  const preferredId = email;

  const rows = await query<{ id: string }>(
    `
    INSERT INTO users (id, email)
    VALUES ($1, $2)
    ON CONFLICT (email)
    DO UPDATE SET email = EXCLUDED.email
    RETURNING id
    `,
    [preferredId, email]
  );

  const userId = rows[0]?.id ?? null;
  return userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getUserIdOrNull();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
