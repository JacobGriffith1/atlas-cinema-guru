"use client";

import { useMemo, useState } from "react";

export type Movie = {
  id: string;
  name: string;
  description: string;
  year: number;
  genres: string[];
  posterUrl: string | null;
  isFavorite: boolean;
  isWatchLater: boolean;
};

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.5a.6.6 0 0 1 1.04 0l2.64 5.35c.1.2.29.34.51.37l5.9.86a.6.6 0 0 1 .33 1.02l-4.27 4.16c-.16.16-.24.38-.2.6l1.01 5.88a.6.6 0 0 1-.87.63L12 19.6l-5.28 2.77a.6.6 0 0 1-.87-.63l1.01-5.88c.04-.22-.03-.44-.2-.6L2.39 11.1a.6.6 0 0 1 .33-1.02l5.9-.86c.22-.03.41-.17.51-.37l2.35-4.8Z"
      />
    </svg>
  );
}

function IconClock({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7v5l3 2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

export function MovieCard({
  movie,
  onToggleFavorite,
  onToggleWatchLater,
}: {
  movie: Movie;
  onToggleFavorite: (id: string, next: boolean) => Promise<void>;
  onToggleWatchLater: (id: string, next: boolean) => Promise<void>;
}) {
  const [busy, setBusy] = useState<"fav" | "wl" | null>(null);

  const genresText = useMemo(() => movie.genres.join(", "), [movie.genres]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="aspect-[2/3] w-full bg-neutral-900">
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.posterUrl}
            alt={movie.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            No poster
          </div>
        )}

        {/* Hover overlay: details */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="text-sm font-semibold">{movie.name}</div>
          <div className="mt-0.5 text-xs text-neutral-300">
            {movie.year} • {genresText}
          </div>
          <div className="mt-2 line-clamp-3 text-xs text-neutral-300">
            {movie.description || "No description."}
          </div>
        </div>

        {/* Hover actions */}
        <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            disabled={busy !== null}
            className="rounded-full bg-neutral-950/70 p-2 text-neutral-100 hover:bg-neutral-950"
            aria-label={movie.isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={async () => {
              setBusy("fav");
              try {
                await onToggleFavorite(movie.id, !movie.isFavorite);
              } finally {
                setBusy(null);
              }
            }}
            title={movie.isFavorite ? "Unfavorite" : "Favorite"}
          >
            <IconStar filled={movie.isFavorite} />
          </button>

          <button
            type="button"
            disabled={busy !== null}
            className="rounded-full bg-neutral-950/70 p-2 text-neutral-100 hover:bg-neutral-950"
            aria-label={movie.isWatchLater ? "Remove from watch later" : "Add to watch later"}
            onClick={async () => {
              setBusy("wl");
              try {
                await onToggleWatchLater(movie.id, !movie.isWatchLater);
              } finally {
                setBusy(null);
              }
            }}
            title={movie.isWatchLater ? "Remove watch later" : "Watch later"}
          >
            <IconClock filled={movie.isWatchLater} />
          </button>
        </div>
      </div>

      {/* Non-hover footer (optional) */}
      <div className="p-3">
        <div className="text-sm font-semibold">{movie.name}</div>
        <div className="mt-0.5 text-xs text-neutral-400">{movie.year}</div>
      </div>
    </div>
  );
}
