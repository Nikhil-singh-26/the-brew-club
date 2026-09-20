import React from "react";
import Link from "next/link";

const About = () => {
  return (
    <main className="bg-[#0b0b0f] text-white overflow-hidden">

      <section className="relative px-6 pt-20 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-orange-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3 text-sm text-gray-400 mb-7">
            <span>☕</span>
            Welcome to The Brew Club
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Good work deserves
            <span className="text-orange-400"> good people behind it.</span>
          </h1>

          <p className="mt-7 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
            The Brew Club is a place where creators can share what they're
            working on and the people who enjoy their work can lend a hand.
          </p>

        </div>
      </section>


      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            <div>
              <p className="text-orange-400 text-sm font-medium uppercase tracking-widest mb-4">
                Why we built it
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Not every creator needs a crowd.
                <br />
                Sometimes they just need a few people who care.
              </h2>
            </div>

            <div className="space-y-5 text-gray-400 leading-relaxed">
              <p>
                A lot of great ideas start small. A side project, a new
                video, a piece of music, a useful tool, or something that
                simply hasn't existed before.
              </p>

              <p>
                The Brew Club gives creators a simple place to share those
                ideas and gives their supporters an easy way to say,
                <span className="text-gray-200"> "Keep going."</span>
              </p>

              <p>
                No complicated campaigns. No pressure to build a huge
                audience. Just creators, supporters, and a little help when
                it matters.
              </p>
            </div>

          </div>

        </div>
      </section>


      <section className="border-y border-white/[0.07] bg-white/1.5 px-6 py-24">

        <div className="max-w-6xl mx-auto">

          <div className="max-w-2xl mb-14">

            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest mb-4">
              How it works
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold">
              Simple enough to feel natural.
            </h2>

            <p className="mt-4 text-gray-400 leading-relaxed">
              There's no complicated process. Find someone you like,
              see what they're working on, and decide if you'd like to
              support them.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-6">

            <div className="relative rounded-2xl border border-white/8 bg-[#0b0b0f] p-7">

              <div className="text-orange-400 text-sm font-semibold mb-8">
                01
              </div>

              <div className="text-4xl mb-6">
                ✨
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Find someone worth backing
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Discover creators and see what they're making, building,
                or dreaming about.
              </p>

            </div>


            <div className="relative rounded-2xl border border-white/8 bg-[#0b0b0f] p-7">

              <div className="text-orange-400 text-sm font-semibold mb-8">
                02
              </div>

              <div className="text-4xl mb-6">
                ☕
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Show your support
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                If their work means something to you, contribute what
                feels right and help them take the next step.
              </p>

            </div>


            <div className="relative rounded-2xl border border-white/8 bg-[#0b0b0f] p-7">

              <div className="text-orange-400 text-sm font-semibold mb-8">
                03
              </div>

              <div className="text-4xl mb-6">
                💫
              </div>

              <h3 className="text-xl font-semibold mb-3">
                Keep the work moving
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Your support gives creators a little more room to focus
                on the work instead of worrying about what's next.
              </p>

            </div>

          </div>

        </div>
      </section>


      <section className="px-6 py-24">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14">

            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest mb-4">
              Everyone brings something
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold">
              It's a two-way thing.
            </h2>

            <p className="mt-4 text-gray-400">
              Creators bring the work. Supporters bring the encouragement.
            </p>

          </div>


          <div className="grid md:grid-cols-2 gap-6">

            <div className="rounded-3xl border border-white/8 bg-linear-to-br from-orange-500/8 to-transparent p-8 sm:p-10">

              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl mb-7">
                🎨
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                For creators
              </h3>

              <p className="text-gray-400 leading-relaxed mb-7">
                Share your work, tell people what you're building, and
                give the people who believe in you a simple way to help.
              </p>

              <ul className="space-y-3 text-sm text-gray-300">
                <li>✓ Create your own page</li>
                <li>✓ Share your work and story</li>
                <li>✓ Receive direct support</li>
                <li>✓ Keep creating on your own terms</li>
              </ul>

            </div>


            <div className="rounded-3xl border border-white/8 bg-white/2.5 p-8 sm:p-10">

              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-7">
                ❤️
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                For supporters
              </h3>

              <p className="text-gray-400 leading-relaxed mb-7">
                You don't have to be a creator to make a difference.
                Sometimes showing up for someone's work is enough.
              </p>

              <ul className="space-y-3 text-sm text-gray-300">
                <li>✓ Discover people doing interesting things</li>
                <li>✓ Support work you genuinely enjoy</li>
                <li>✓ Help ideas move forward</li>
                <li>✓ Be part of someone's journey</li>
              </ul>

            </div>

          </div>

        </div>
      </section>

      <section className="px-6 pb-24">

        <div className="max-w-4xl mx-auto">

          <div className="rounded-3xl border border-white/8 bg-white/2.5 p-8 sm:p-12 text-center">

            <div className="text-4xl mb-6">
              ☕
            </div>

            <p className="text-2xl sm:text-3xl font-medium leading-relaxed">
              "You never know which small bit of encouragement
              becomes the reason someone keeps going."
            </p>

            <p className="mt-5 text-gray-500 text-sm">
              That's what The Brew Club is about.
            </p>

          </div>

        </div>

      </section>


      <section className="px-6 pb-28">

        <div className="max-w-3xl mx-auto text-center">

          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to pull up a chair?
          </h2>

          <p className="mt-4 text-gray-400">
            Find something you believe in, or start sharing your own work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">

            <Link href="/login">
              <button
                type="button"
                className="px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold transition-all duration-200 hover:-translate-y-0.5"
              >
                Join The Brew Club →
              </button>
            </Link>

            <Link href="/">
              <button
                type="button"
                className="px-7 py-3.5 rounded-xl border border-white/10 bg-white/3 hover:bg-white/[0.07] text-white font-medium transition-all duration-200"
              >
                Back to home
              </button>
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
};

export default About;

export const metadata = {
  title: "About - The Brew Club",
};
