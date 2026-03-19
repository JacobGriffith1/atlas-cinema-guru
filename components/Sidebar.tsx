import Link from "next/link";
import { ActivityFeed } from "@/components/ActivityFeed";

const links = [
  { href: "/", label: "Home" },
  { href: "/favorites", label: "Favorites" },
  { href: "/watch-later", label: "Watch Later" },
];

export function Sidebar() {
  return (
    <aside className="group">
      <div className="sticky top-6">
        <div className="h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition-all duration-200 ease-out w-14 group-hover:w-72">
          <div className="flex h-full flex-col">
            {/* Nav */}
            <div className="border-b border-neutral-800 p-2">
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
                    title={l.label}
                  >
                    {/* “icon” placeholder */}
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold text-neutral-200">
                      {l.label.slice(0, 1)}
                    </span>
                    <span className="hidden group-hover:inline">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="flex-1 overflow-hidden p-2">
              <div className="hidden group-hover:block">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Latest Activity
                </div>
                <div className="h-full overflow-auto pr-1">
                  <ActivityFeed />
                </div>
              </div>

              {/* Collapsed hint */}
              <div className="flex h-full items-center justify-center group-hover:hidden">
                <div className="rotate-90 text-xs text-neutral-500">
                  activity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
