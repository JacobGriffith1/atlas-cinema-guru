"use client";

import { useEffect, useState } from "react";
import { MovieCard, type Movie } from "@/components/MovieCard";

type ListResponse = {
  ok: boolean;
  data: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    items: Movie[];
  };
};

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(nextPage: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/favorites?page=${nextPage}`, { cache: "no-store" });
      const json = (await res.json()) as ListResponse;
      if (!json.ok) throw new Error("Request failed");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1).catch(() => {});
  }, []);

  async function toggleFavorite(id: string, next: boolean) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((m) => (m.id === id ? { ...m, isFavorite: next } : m)),
      };
    });

    const res = await fetch(`/api/favorites/${id}`, { method: next ? "POST" : "DELETE" });
    if (!res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((m) => (m.id === id ? { ...m, isFavorite: !next } : m)),
        };
      });
      return;
    }

    // If you unfavorite from Favorites page, remove it from the list immediately.
    if (!next) {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((m) => m.id !== id), total: Math.max(0, prev.total - 1) };
      });
    }
  }

  async function toggleWatchLater(id: string, next: boolean) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((m) => (m.id === id ? { ...m, isWatchLater: next } : m)),
      };
    });

    const res = await fetch(`/api/watch-later/${id}`, { method: next ? "POST" : "DELETE" });
    if (!res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((m) => (m.id === id ? { ...m, isWatchLater: !next } : m)),
        };
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Favorites</h1>
        <p className="mt-1 text-sm text-neutral-300">Movies you’ve favorited.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !data ? <div className="text-sm text-neutral-400">Loading…</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data?.items ?? []).map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onToggleFavorite={toggleFavorite}
            onToggleWatchLater={toggleWatchLater}
          />
        ))}
      </div>

      {data && data.items.length === 0 ? (
        <div className="text-sm text-neutral-400">No favorites yet.</div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {data ? (
            <>
              Page <span className="text-neutral-100">{data.page}</span> of{" "}
              <span className="text-neutral-100">{data.totalPages}</span> •{" "}
              <span className="text-neutral-100">{data.total}</span> total
            </>
          ) : (
            "—"
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-50"
            disabled={!data || page <= 1 || loading}
            onClick={() => {
              const nextPage = Math.max(1, page - 1);
              setPage(nextPage);
              load(nextPage).catch(() => {});
            }}
          >
            Previous
          </button>

          <button
            type="button"
            className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-50"
            disabled={!data || page >= data.totalPages || loading}
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              load(nextPage).catch(() => {});
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
