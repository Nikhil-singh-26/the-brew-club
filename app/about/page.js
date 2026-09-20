import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About The Brew Club - How Community Crowdfunding Works",
  description:
    "Learn why The Brew Club was built, how creators receive direct contributions, and how supporters fuel independent ideas.",
};

const About = () => {
  return (
    <main className="bg-[#0b0b0f] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-120 h-72 bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-amber-300 mb-6">
            <span>☕</span>
            About The Brew Club
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Good work deserves{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              good people behind it.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed">
            The Brew Club is a creator-first platform where fans and supporters
            can directly fund the projects, ideas, and builders they believe in.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Our Philosophy
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Not every creator needs a massive corporate sponsor.
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Many of the web's best software, art, writing, music, and tools start
                as small side passions. Traditional crowdfunding platforms impose steep
                fees, all-or-nothing campaign goals, and complex bureaucracy.
              </p>
              <p>
                The Brew Club strips away the noise: creators get a clean, personal
                space to share their mission, while supporters can contribute anytime
                with simple, seamless payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Process */}
      <section className="border-t border-white/10 bg-white/[0.01] px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Simple Workflow
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold">
              How The Brew Club operates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#0f0f14] p-8">
              <div className="text-amber-400 text-xs font-bold mb-6">STEP 01</div>
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-2">Launch Your Profile</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Claim your custom handle, add your avatar and cover banner, and connect your Razorpay account in minutes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f0f14] p-8">
              <div className="text-amber-400 text-xs font-bold mb-6">STEP 02</div>
              <div className="text-3xl mb-4">☕</div>
              <h3 className="text-lg font-bold mb-2">Share With Supporters</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Put your Brew Club link on your GitHub, YouTube, Twitter, blog, or newsletter for your community to back you.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f0f14] p-8">
              <div className="text-amber-400 text-xs font-bold mb-6">STEP 03</div>
              <div className="text-3xl mb-4">💫</div>
              <h3 className="text-lg font-bold mb-2">Receive Direct Funds</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every contribution goes directly to your linked gateway with transparent messages on your supporter wall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to be part of the club?
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Create your page in seconds and start receiving support from people who value your work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-black font-bold transition-all duration-200 shadow-lg shadow-orange-500/20"
            >
              Join The Brew Club →
            </Link>
            <Link
              href="/"
              className="px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
