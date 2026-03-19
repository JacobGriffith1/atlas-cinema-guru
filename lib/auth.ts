import { auth } from "@/auth";
import { query } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email ? normalizeEmail(session.user.email) : null;

  if (!email) return null;

  // Use email as the stable internal user id (simple + avoids uniqueness conflicts).
  const userId = email;

  // Ensure a row exists; safe even if called repeatedly.
  await query(
    `
    INSERT INTO users (id, email)
    VALUES ($1, $2)
    ON CONFLICT (id)
    DO UPDATE SET email = EXCLUDED.email
    `,
    [userId, email]
  );

  return userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getUserIdOrNull();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
