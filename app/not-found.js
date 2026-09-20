import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#0b0b0f] text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-3xl mb-6">
        ☕
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight">
        404 - Page or Creator Not Found
      </h1>

      <p className="mt-3 text-sm text-gray-400 max-w-md">
        The page or creator profile you are looking for doesn't exist, was renamed,
        or is no longer available.
      </p>

      <div className="flex items-center gap-4 mt-8">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition hover:opacity-95"
        >
          Return Home
        </Link>
        <Link
          href="/about"
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Learn More
        </Link>
      </div>
    </main>
  );
}
