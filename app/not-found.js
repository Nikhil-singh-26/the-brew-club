import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#F7F4EE] text-[#1E1D1A]">
      <div className="h-14 w-14 rounded-[10px] bg-[#F5E8E0] text-[#C86B3C] text-2xl flex items-center justify-center mb-4 border border-[#DED8CE] shadow-xs">
        ☕
      </div>

      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Page or creator not found
      </h1>

      <p className="mt-2 text-xs text-[#6F6A60] max-w-sm">
        The page or creator profile you are looking for doesn&apos;t exist, was renamed,
        or is no longer available.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/creators"
          className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
        >
          Explore creators
        </Link>
        <Link
          href="/"
          className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] hover:bg-[#F0ECE4] px-4 py-2 text-xs font-medium text-[#1E1D1A] shadow-xs transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
