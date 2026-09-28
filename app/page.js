import Link from "next/link";
import CreatorCard from "@/components/CreatorCard";
import { fetchCreators } from "@/actions/useractions";

export const metadata = {
  title: "The Brew Club — Discover people building things worth supporting",
  description:
    "The Brew Club is a place where creators can share what they're working on and the people who enjoy their work can lend a hand.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await fetchCreators({ limit: 6 });
  const creators = data?.creators || [];
  const featuredCreator = creators[0] || null;

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A]">
      {/* ================================================== */}
      {/* 1. HERO SECTION WITH RICH COMPOSITION */}
      {/* ================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#DED8CE]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Content */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-3 py-1 text-xs font-semibold text-[#C86B3C] shadow-xs">
                <span>☕</span>
                <span>Independent Creator Community</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1E1D1A] leading-[1.08]">
                Discover people building things{" "}
                <span className="text-[#C86B3C]">worth supporting.</span>
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-[#6F6A60] leading-relaxed">
                The Brew Club gives creators a clean, personal space to share what they&apos;re working on and gives supporters a simple way to lend a hand.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/creators"
                  className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xs hover:shadow-sm transition-all"
                >
                  Explore creators →
                </Link>

                <Link
                  href="/join"
                  className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] hover:bg-[#F0ECE4] hover:border-[#C5BDB0] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#1E1D1A] shadow-xs transition"
                >
                  Start creating
                </Link>
              </div>

              {/* Trust Features */}
              <div className="pt-6 border-t border-[#DED8CE]/60 flex flex-wrap items-center gap-6 text-xs text-[#6F6A60]">
                <div className="flex items-center gap-2">
                  <span className="text-[#557A5C] font-bold">✓</span>
                  <span>Direct Razorpay payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#557A5C] font-bold">✓</span>
                  <span>Personal creator homepages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#557A5C] font-bold">✓</span>
                  <span>Verified supporter notes</span>
                </div>
              </div>
            </div>

            {/* Right Hero Composition (Real Application Previews) */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Background decorative card */}
                <div className="absolute -top-3 -right-3 h-full w-full rounded-[12px] bg-[#F0ECE4] border border-[#DED8CE]" />

                {/* Main Hero Card Preview */}
                <div className="relative rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-md">
                  {featuredCreator ? (
                    <div className="space-y-4">
                      {/* Top snippet */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-[8px] bg-[#F5E8E0] border border-[#DED8CE] overflow-hidden flex items-center justify-center font-bold text-lg text-[#C86B3C]">
                            {featuredCreator.profilepic ? (
                              <img
                                src={featuredCreator.profilepic}
                                alt={featuredCreator.name || featuredCreator.username}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (featuredCreator.name || featuredCreator.username).charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-heading text-base font-bold text-[#1E1D1A]">
                              {featuredCreator.name || featuredCreator.username}
                            </p>
                            <p className="text-xs text-[#C86B3C]">
                              @{featuredCreator.username}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-[5px] bg-[#F5E8E0] text-[#C86B3C] px-2 py-0.5 text-[10px] font-semibold">
                          Active Creator
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-[#6F6A60] leading-relaxed">
                        {featuredCreator.bio || "Building web products and sharing creative tools with the community."}
                      </p>

                      {/* Current building snippet */}
                      {featuredCreator.currentWork && (
                        <div className="rounded-[6px] bg-[#F7F4EE] border border-[#DED8CE]/70 p-2.5 text-xs text-[#1E1D1A]">
                          <span className="text-[#918B80] font-medium block text-[10px]">CURRENTLY BUILDING:</span>
                          <span className="font-semibold">{featuredCreator.currentWork}</span>
                        </div>
                      )}

                      {/* Interactive Support Preview Button */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#DED8CE]/60 text-xs">
                        <span className="text-[#6F6A60]">Support with a cup of coffee</span>
                        <Link
                          href={`/${featuredCreator.username}`}
                          className="rounded-[6px] bg-[#C86B3C] hover:bg-[#A9552F] text-white px-3 py-1.5 font-medium transition shadow-xs"
                        >
                          Support @{featuredCreator.username} ↗
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Fallback live preview */
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-[8px] bg-[#F5E8E0] text-[#C86B3C] flex items-center justify-center font-bold text-lg border border-[#DED8CE]">
                          ☕
                        </div>
                        <div>
                          <p className="font-heading text-base font-bold text-[#1E1D1A]">
                            The Brew Club Creator
                          </p>
                          <p className="text-xs text-[#C86B3C]">
                            @creator
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#6F6A60] leading-relaxed">
                        Building independent web apps, open-source software, and sharing the journey in public.
                      </p>
                      <Link
                        href="/join"
                        className="block w-full text-center rounded-[6px] bg-[#C86B3C] text-white py-2 text-xs font-medium"
                      >
                        Claim your creator handle →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sub-card floating badge */}
                <div className="mt-3 flex items-center justify-between rounded-[8px] border border-[#DED8CE] bg-[#FFFFFF] px-4 py-2.5 shadow-xs text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#557A5C]" />
                    <span className="font-medium text-[#1E1D1A]">Real Supporter Backing</span>
                  </div>
                  <span className="text-[#6F6A60]">Instant sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. ACTIVE CREATORS DIRECTORY PREVIEW */}
      {/* ================================================== */}
      {creators.length > 0 && (
        <section className="py-16 md:py-20 border-b border-[#DED8CE]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold text-[#C86B3C] uppercase tracking-wider block mb-1">
                  Community Showcase
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1D1A]">
                  People building on The Brew Club
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#6F6A60]">
                  Support independent builders, designers, and creators directly.
                </p>
              </div>

              <Link
                href="/creators"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C86B3C] hover:text-[#A9552F] transition"
              >
                <span>View all creators</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {creators.slice(0, 6).map((creator) => (
                <CreatorCard key={creator._id || creator.username} creator={creator} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 3. PLATFORM PILLARS / HOW IT OPERATES */}
      {/* ================================================== */}
      <section className="py-16 md:py-20 border-b border-[#DED8CE] bg-[#F0ECE4]/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold text-[#C86B3C] uppercase tracking-wider block mb-1">
              How It Works
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E1D1A]">
              Designed for creators who build in public
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#6F6A60]">
              A calm, reliable space to share your mission without algorithmic noise or subscription walls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-4">
                01
              </span>
              <h3 className="font-heading text-base font-bold text-[#1E1D1A] mb-2">
                Set up your personal space
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Claim your custom handle, add your narrative story, showcase your projects, and link your Razorpay credentials.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-4">
                02
              </span>
              <h3 className="font-heading text-base font-bold text-[#1E1D1A] mb-2">
                Share your journey
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Add your Brew Club link to your GitHub repositories, Twitter bio, newsletters, and portfolio demos.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-4">
                03
              </span>
              <h3 className="font-heading text-base font-bold text-[#1E1D1A] mb-2">
                Receive direct contributions
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Supporters back your work with frictionless payments. Transactions settle directly into your linked account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. FINAL CTA BANNER */}
      {/* ================================================== */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-8 sm:p-12 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <h2 className="font-heading text-2xl font-bold text-[#1E1D1A]">
                Ready to launch your creator page?
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6A60] leading-relaxed">
                Join independent creators sharing their progress and receiving direct backing from their community.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/join"
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] px-5 py-2.5 text-xs font-medium text-white shadow-xs transition"
              >
                Join the club →
              </Link>
              <Link
                href="/creators"
                className="rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] px-4 py-2.5 text-xs font-medium text-[#1E1D1A] transition"
              >
                Browse creators
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
