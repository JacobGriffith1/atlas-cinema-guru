import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/titles", label: "Titles" },
  { href: "/favorites", label: "Favorites" },
  { href: "/watch-later", label: "Watch Later" },
  { href: "/activities", label: "Activity" }
];

export function Nav() {
  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Cinema Guru
        </Link>

        <nav className="flex flex-wrap gap-2">
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
      </div>
    </header>
  );
}
