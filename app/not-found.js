import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#171613] text-[#F4F0E8]">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Page or creator not found
      </h1>

      <p className="mt-2 text-xs text-[#AAA59A] max-w-sm">
        The page or creator profile you are looking for doesn&apos;t exist, was renamed,
        or is no longer available.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/creators"
          className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-4 py-2 text-xs font-medium text-white transition-colors"
        >
          Explore creators
        </Link>
        <Link
          href="/"
          className="rounded-[7px] border border-[#34322C] bg-[#201F1B] hover:bg-[#282721] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
