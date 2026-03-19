import Link from "next/link"
import { auth, signOut } from "@/auth"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/favorites", label: "Favorites" },
  { href: "/watch-later", label: "Watch Later" },
  { href: "/activities", label: "Activity" },
]

export async function Nav() {
  const session = await auth()
  const email = session?.user?.email ?? ""

  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Cinema Guru
        </Link>

        <nav className="hidden flex-wrap gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden text-sm text-neutral-300 sm:inline">
                {email}
              </span>

              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/login" })
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}