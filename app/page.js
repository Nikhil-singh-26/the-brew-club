import Link from "next/link";

export const metadata = {
  title: "The Brew Club - Creator Crowdfunding & Direct Supporter Platform",
  description:
    "A direct creator-support platform where fans and supporters back the projects, ideas, and builders they believe in.",
};

export default function Home() {
  return (
    <main className="bg-[#0b0b0f] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center px-6 py-16">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-120 h-72 bg-linear-to-r from-amber-500/15 to-orange-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-amber-300">
            <span>☕</span>
            Fuel the work of independent creators
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
            Empower creators,{" "}
            <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              one brew at a time.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The Brew Club makes it effortless for creators to fund their craft
            through direct supporter contributions. No middleman friction, just
            genuine support for what you build.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 hover:opacity-95 text-black font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-orange-500/20 text-center"
            >
              Start Your Creator Page →
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-200 text-center"
            >
              Explore How It Works
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-500">
            Quick 2-minute setup · Direct Razorpay payouts · Zero platform lock-in
          </p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Why The Brew Club
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Designed for genuine creator connections
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Everything you need to turn your supporters' appreciation into sustainable creative momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/2 p-8 hover:bg-white/4 transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400/10 text-2xl mb-6">
              🎨
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">
              Your Personal Creator Space
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Create a custom public profile with your banner, avatar, bio, and direct contribution link to share with your audience.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/2 p-8 hover:bg-white/4 transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400/10 text-2xl mb-6">
              ⚡
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">
              Direct & Instant Payments
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Receive funds straight into your linked Razorpay gateway with instant verification, UPI, card, and net banking support.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/2 p-8 hover:bg-white/4 transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-400/10 text-2xl mb-6">
              💬
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">
              Supporter Community Wall
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Celebrate your supporters with real-time contribution messages, badges, and transparent public backing counts.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-linear-to-br from-amber-500/10 via-white/2 to-transparent p-8 sm:p-12 text-center">
          <span className="text-3xl">☕</span>
          <p className="mt-4 text-xl sm:text-2xl font-medium text-gray-200 leading-relaxed">
            "A small vote of confidence from a supporter can be the exact spark that turns a side project into something extraordinary."
          </p>
          <p className="mt-4 text-xs font-semibold text-amber-400 uppercase tracking-widest">
            The Brew Club Mission
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-24 border-t border-white/10 pt-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to claim your creator page?
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Join other passionate builders, creators, and artists who are funded by their own community.
          </p>
          <Link
            href="/login"
            className="inline-block mt-8 px-8 py-3.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 hover:opacity-95 text-black font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
          >
            Get Started with The Brew Club →
          </Link>
        </div>
      </section>
    </main>
  );
}
