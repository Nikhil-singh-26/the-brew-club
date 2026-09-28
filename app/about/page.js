import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About The Brew Club - How Independent Funding Works",
  description:
    "Learn why The Brew Club was built, how creators receive direct contributions, and how supporters fuel independent ideas.",
};

const About = () => {
  return (
    <main className="bg-[#171613] text-[#F4F0E8] min-h-screen">
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#F4F0E8] leading-tight">
          Good work deserves{" "}
          <span className="text-[#C96F43]">good people behind it.</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-[#AAA59A] leading-relaxed max-w-2xl">
          The Brew Club was created to make supporting independent creators simple,
          direct, and personal. No complex corporate campaigns or high platform fees.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="px-6 py-12 border-t border-[#34322C]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <h2 className="font-heading text-xl font-bold text-[#F4F0E8]">
              The philosophy
            </h2>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-[#AAA59A] leading-relaxed">
            <p>
              Much of the web&apos;s best writing, software, art, tools, and research start
              as small side passions. Traditional platforms often turn creators into
              marketers running high-stress all-or-nothing campaigns.
            </p>
            <p>
              We believe in a calmer approach: give creators a quiet, beautiful home
              to share what they are building, and let the people who enjoy their work
              lend a hand whenever they want.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="px-6 py-12 border-t border-[#34322C]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-xl font-bold text-[#F4F0E8] mb-8">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-5">
              <span className="text-xs font-mono text-[#C96F43] block mb-3">01</span>
              <h3 className="font-heading text-sm font-semibold text-[#F4F0E8] mb-2">
                Set up your page
              </h3>
              <p className="text-xs text-[#AAA59A] leading-relaxed">
                Choose your handle, write a short bio, and link your Razorpay gateway or payment link in minutes.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-5">
              <span className="text-xs font-mono text-[#C96F43] block mb-3">02</span>
              <h3 className="font-heading text-sm font-semibold text-[#F4F0E8] mb-2">
                Share your journey
              </h3>
              <p className="text-xs text-[#AAA59A] leading-relaxed">
                Add your link to your projects, GitHub repos, newsletters, or social bios for supporters to find.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-5">
              <span className="text-xs font-mono text-[#C96F43] block mb-3">03</span>
              <h3 className="font-heading text-sm font-semibold text-[#F4F0E8] mb-2">
                Receive direct backing
              </h3>
              <p className="text-xs text-[#AAA59A] leading-relaxed">
                Contributions go directly into your account with messages of encouragement from your supporters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 border-t border-[#34322C]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#F4F0E8]">
              Ready to start?
            </h2>
            <p className="mt-1 text-xs text-[#AAA59A]">
              Create your creator space or discover people building things worth supporting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creators"
              className="rounded-[7px] border border-[#34322C] bg-[#201F1B] hover:bg-[#282721] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition-colors"
            >
              Explore creators
            </Link>
            <Link
              href="/join"
              className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-4 py-2 text-xs font-medium text-white transition-colors"
            >
              Join the club →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
