import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About The Brew Club - How Community Crowdfunding Works",
  description:
    "Learn why The Brew Club was built, how creators receive direct contributions, and how supporters fuel independent ideas.",
};

const About = () => {
  return (
    <main className="bg-[#F7F4EE] text-[#1E1D1A] min-h-screen">
      {/* Hero Section */}
      <section className="px-6 pt-16 pb-14 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#F5E8E0] text-xs font-semibold text-[#C86B3C] mb-4">
          <span>☕</span>
          About The Brew Club
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#1E1D1A] leading-tight">
          Good work deserves{" "}
          <span className="text-[#C86B3C]">good people behind it.</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-[#6F6A60] leading-relaxed max-w-2xl">
          The Brew Club was created to make supporting independent creators simple,
          direct, and personal. No complex corporate campaigns, algorithms, or high platform fees.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="px-6 py-12 border-t border-[#DED8CE]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <h2 className="font-heading text-xl font-bold text-[#1E1D1A]">
              The Philosophy
            </h2>
            <p className="mt-1 text-xs text-[#6F6A60]">
              Why direct creator crowdfunding matters.
            </p>
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-[#6F6A60] leading-relaxed rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
            <p>
              Much of the web&apos;s best writing, software, art, tools, and research start
              as small side passions. Traditional crowdfunding platforms often turn creators into
              marketers running high-stress all-or-nothing campaigns with heavy fees.
            </p>
            <p>
              We believe in a calmer approach: give creators a quiet, beautiful home
              to share what they are building, and let the people who enjoy their work
              lend a hand whenever they want with direct payments.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="px-6 py-12 border-t border-[#DED8CE] bg-[#F0ECE4]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-xl font-bold text-[#1E1D1A] mb-8">
            How The Brew Club works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-3">
                01
              </span>
              <h3 className="font-heading text-sm font-bold text-[#1E1D1A] mb-2">
                Set up your page
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Choose your custom handle, write your story, and link your Razorpay credentials in minutes.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-3">
                02
              </span>
              <h3 className="font-heading text-sm font-bold text-[#1E1D1A] mb-2">
                Share your journey
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Add your Brew Club link to your GitHub repos, newsletters, or social bios for supporters to find.
              </p>
            </div>

            <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F5E8E0] text-xs font-mono font-bold text-[#C86B3C] mb-3">
                03
              </span>
              <h3 className="font-heading text-sm font-bold text-[#1E1D1A] mb-2">
                Receive direct funds
              </h3>
              <p className="text-xs text-[#6F6A60] leading-relaxed">
                Contributions settle directly into your account with transparent notes on your supporter wall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 border-t border-[#DED8CE]">
        <div className="max-w-4xl mx-auto rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1E1D1A]">
              Ready to be part of the club?
            </h2>
            <p className="mt-1 text-xs text-[#6F6A60]">
              Create your page in seconds or discover creators to back today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creators"
              className="rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] px-4 py-2 text-xs font-medium text-[#1E1D1A] transition"
            >
              Explore creators
            </Link>
            <Link
              href="/join"
              className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
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
