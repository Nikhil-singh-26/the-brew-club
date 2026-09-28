import Link from "next/link";

export const metadata = {
  title: "The Brew Club — Good work deserves good people behind it",
  description:
    "The Brew Club is a place where creators can share what they're working on and the people who enjoy their work can lend a hand.",
};

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#171613] text-[#F4F0E8]">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1 text-xs font-medium text-[#C96F43]">
            <span>☕</span>
            <span>Independent creator support</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#F4F0E8] leading-[1.08]">
            Good work deserves <br className="hidden sm:block" />
            good people behind it.
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-[#AAA59A] leading-relaxed">
            The Brew Club is a place where creators can share what they&apos;re working on and the people who enjoy their work can lend a hand. Direct support, zero fluff.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/creators"
              className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#B55E34] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#171613] transition shadow-xs"
            >
              Explore creators
            </Link>

            <Link
              href="/join"
              className="rounded-[7px] border border-[#34322C] bg-[#201F1B] hover:bg-[#282721] hover:border-[#48453D] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#F4F0E8] transition"
            >
              Start creating
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Principles Section */}
      <section className="border-t border-[#34322C] bg-[#171613]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#F4F0E8]">
              Built for people who make things
            </h2>
            <p className="mt-2 text-sm text-[#AAA59A]">
              A quiet, dependable platform to share your journey and receive support from your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-[#C96F43]">01</span>
              <h3 className="font-heading text-base font-semibold text-[#F4F0E8]">
                Direct to your account
              </h3>
              <p className="text-xs sm:text-sm text-[#AAA59A] leading-relaxed">
                Connect your personal Razorpay link or custom gateway. Contributions flow directly to you with clear verification.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-[#C96F43]">02</span>
              <h3 className="font-heading text-base font-semibold text-[#F4F0E8]">
                Your personal page
              </h3>
              <p className="text-xs sm:text-sm text-[#AAA59A] leading-relaxed">
                A clean, focused space for what you&apos;re currently building, your story, your featured projects, and why support matters.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-[#C96F43]">03</span>
              <h3 className="font-heading text-base font-semibold text-[#F4F0E8]">
                Genuine community
              </h3>
              <p className="text-xs sm:text-sm text-[#AAA59A] leading-relaxed">
                Real messages of encouragement from supporters who believe in your work. No artificial metrics or distracting noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout Section */}
      <section className="border-t border-[#34322C] bg-[#201F1B]">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-lg">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-[#F4F0E8]">
              Ready to set up your creator space?
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA59A]">
              It takes less than two minutes to configure your profile and start receiving support.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/join"
              className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#B55E34] px-4 py-2 text-xs font-semibold text-[#171613] transition"
            >
              Join The Brew Club
            </Link>
            <Link
              href="/creators"
              className="rounded-[7px] border border-[#34322C] bg-[#282721] hover:bg-[#2F2D27] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition"
            >
              Browse creators
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
