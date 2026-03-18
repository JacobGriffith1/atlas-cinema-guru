import { cookies } from "next/headers";

const COOKIE_NAME = "cg_session";

export async function requireUserId(): Promise<string> {
  const userId = cookies().get(COOKIE_NAME)?.value;
  if (!userId) throw new Error("Not authenticated. Visit /api/seed first.");
  return userId;
}

export async function getUserIdOrNull(): Promise<string | null> {
  return cookies().get(COOKIE_NAME)?.value ?? null;
}

export function setSessionCookie(userId: string) {
  cookies().set(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}
