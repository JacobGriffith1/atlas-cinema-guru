import { query } from "@/lib/db";
import { getUserIdOrNull } from "@/lib/auth";

type Row = {
  type: string;
  createdAt: string; // returned as ISO string-ish from pg mapping
  title: string | null;
};

function labelForType(type: string) {
  if (type === "FAVORITE_ADD") return "Favorited";
  if (type === "WATCH_LATER_ADD") return "Watch later";
  if (type === "FAVORITE_REMOVE") return "Unfavorited";
  if (type === "WATCH_LATER_REMOVE") return "Removed watch later";
  return type;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function ActivityFeed() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return (
      <div className="px-2 py-2 text-sm text-neutral-400">
        Sign in to see activity.
      </div>
    );
  }

  const rows = await query<Row>(
    `
    SELECT
      a.type AS "type",
      a.created_at AS "createdAt",
      t.name AS "title"
    FROM activities a
    LEFT JOIN titles t ON t.id = a.title_id
    WHERE a.user_id = $1
    ORDER BY a.created_at DESC
    LIMIT 12
    `,
    [userId]
  );

  if (rows.length === 0) {
    return (
      <div className="px-2 py-2 text-sm text-neutral-400">
        No activity yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((r, idx) => (
        <li key={`${r.type}-${r.createdAt}-${idx}`} className="rounded-lg border border-neutral-800 p-2">
          <div className="text-xs text-neutral-400">{formatDateTime(r.createdAt)}</div>
          <div className="text-sm text-neutral-100">{r.title ?? "Unknown title"}</div>
          <div className="text-xs text-neutral-300">{labelForType(r.type)}</div>
        </li>
      ))}
    </ul>
  );
}
