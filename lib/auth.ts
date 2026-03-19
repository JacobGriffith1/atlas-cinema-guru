import { auth } from "@/auth";
import { query } from "@/lib/db";

export async function getUserIdOrNull(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const githubId = session?.user?.id ?? null;

  if (!email || !githubId) return null;

  // Internal id: stable and readable
  const userId = `gh_${githubId}`;

  // Ensure a user row exists (id is stable; email can be updated)
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
