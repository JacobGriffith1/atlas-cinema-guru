import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Nav() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Cinema Guru
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-300 sm:inline">
            {email}
          </span>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
