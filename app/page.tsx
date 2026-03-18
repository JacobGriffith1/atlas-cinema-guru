export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Cinema Guru</h1>
      <p className="text-neutral-300">
        Scaffold is up. Next step: build the Figma UI + wire to the API.
      </p>

      <div className="rounded-lg border border-neutral-800 p-4">
        <div className="mb-2 font-semibold">Backend quick links</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
          <li>
            <a className="underline hover:text-neutral-100" href="/api/seed">
              GET /api/seed
            </a>
          </li>
          <li>
            <a
              className="underline hover:text-neutral-100"
              href="/api/titles?page=1&minYear=2023&maxYear=2024&genres=Sci-Fi,Mystery"
            >
              GET /api/titles?page=1&minYear=2023&maxYear=2024&genres=Sci-Fi,Mystery
            </a>
          </li>
          <li>
            <a className="underline hover:text-neutral-100" href="/api/favorites?page=1">
              GET /api/favorites?page=1
            </a>
          </li>
          <li>
            <a className="underline hover:text-neutral-100" href="/api/watch-later?page=1">
              GET /api/watch-later?page=1
            </a>
          </li>
          <li>
            <a className="underline hover:text-neutral-100" href="/api/activities?page=1">
              GET /api/activities?page=1
            </a>
          </li>
        </ul>

        <p className="mt-3 text-xs text-neutral-400">
          Tip: visit /api/seed first so user-scoped endpoints stop returning 401.
        </p>
      </div>
    </div>
  );
}
