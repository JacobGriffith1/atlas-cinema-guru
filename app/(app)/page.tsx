"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MovieCard, type Movie } from "@/components/MovieCard";

type TitlesResponse = {
  ok: boolean;
  data: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    items: Movie[];
  };
};

type GenresResponse = {
  ok: boolean;
  data: { items: string[] };
};

function buildQuery(params: Record<string, string | string[] | number | null | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      sp.set(k, v.join(","));
    } else {
      const s = String(v).trim();
      if (s.length === 0) continue;
      sp.set(k, s);
    }
  }
  return sp.toString();
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [genreOptions, setGenreOptions] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [data, setData] = useState<TitlesResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const searchDebounceRef = useRef<number | null>(null);

  const selectedGenresText = useMemo(() => genres.join(", "), [genres]);

  async function loadGenres() {
    const res = await fetch(`/api/genres`, { cache: "no-store" });
    const json = (await res.json()) as GenresResponse;
    if (json.ok) setGenreOptions(json.data.items);
  }

  async function loadTitles(nextPage: number, nextSearch: string) {
    setLoading(true);
    setError("");
    try {
      const qs = buildQuery({
        page: nextPage,
        minYear: minYear ? Number(minYear) : null,
        maxYear: maxYear ? Number(maxYear) : null,
        genres,
        search: nextSearch,
      });

      const res = await fetch(`/api/titles?${qs}`, { cache: "no-store" });
      const json = (await res.json()) as TitlesResponse;

      if (!json.ok) throw new Error("Request failed");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGenres().catch(() => {});
  }, []);

  // Reload when non-search filters change immediately
  useEffect(() => {
    setPage(1);
    loadTitles(1, search).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minYear, maxYear, genres]);

  // Debounce search (case-insensitive happens server-side)
  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(() => {
      setPage(1);
      loadTitles(1, search).catch(() => {});
    }, 250);

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleFavorite(id: string, next: boolean) {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((m) => (m.id === id ? { ...m, isFavorite: next } : m)),
      };
    });

    const res = await fetch(`/api/favorites/${id}`, { method: next ? "POST" : "DELETE" });
    if (!res.ok) {
      // revert
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((m) => (m.id === id ? { ...m, isFavorite: !next } : m)),
        };
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
        <h1 className="text-3xl font-semibold">Movies</h1>
        <p className="mt-1 text-sm text-neutral-300">
          Search, filter, then favorite or save to watch later.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Min Year
            </label>
            <input
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2020"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Max Year
            </label>
            <input
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2026"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Genres
              </div>
              <div className="mt-1 text-sm text-neutral-300">
                {genres.length ? (
                  <>Selected: <span className="text-neutral-100">{selectedGenresText}</span></>
                ) : (
                  <>Select one or more genres</>
                )}
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-50"
              disabled={genres.length === 0}
              onClick={() => setGenres([])}
            >
              Clear
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {genreOptions.map((g) => {
              const selected = genres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm ${
                    selected
                      ? "border-neutral-200 bg-neutral-200 text-neutral-950"
                      : "border-neutral-800 text-neutral-200 hover:bg-neutral-900"
                  }`}
                  onClick={() => {
                    setGenres((prev) =>
                      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
                    );
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status */}
      {error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="text-sm text-neutral-400">Loading…</div>
      ) : null}

      {/* Grid */}
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

      {/* Pagination */}
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
              loadTitles(nextPage, search).catch(() => {});
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
              loadTitles(nextPage, search).catch(() => {});
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
