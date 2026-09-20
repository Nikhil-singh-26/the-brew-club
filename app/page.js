import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#0b0b0f] text-white overflow-hidden">

      <section className="relative min-h-[78vh] flex items-center justify-center px-6">
        
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-125 h-75 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 mb-7 rounded-full border border-white/10 bg-white/4 text-sm text-gray-300">
            <span className="text-lg">☕</span>
            Support the people you believe in
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              The Brew Club
            </h1>

            <img
              src="/tea.gif"
              width={90}
              alt="Cup of chai"
              className="w-16 sm:w-20 md:w-22.5"
            />
          </div>

          <p className="mt-7 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A simple way for creators to turn support into something real.
            Your fans can buy you a chai and help you keep building.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-9">

            <Link href="/login">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-orange-500/10"
              >
                Start Your Page →
              </button>
            </Link>

            <Link href="/about">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-white font-medium transition-all duration-200"
              >
                How it works
              </button>
            </Link>

          </div>

          <p className="mt-5 text-xs text-gray-600">
            No complicated setup. Just you, your work, and your supporters.
          </p>
        </div>
      </section>


      {/* Divider */}
      <div className="h-px bg-white/8" />


      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">

        <div className="text-center max-w-2xl mx-auto">
          <p className="text-orange-400 text-sm font-medium uppercase tracking-widest mb-3">
            Why it works
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold">
            Your fans are more than followers.
          </h2>

          <p className="mt-4 text-gray-400 leading-relaxed">
            They're people who enjoy what you create and want to see you
            create more of it.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">

          {/* Card 1 */}
          <div className="group rounded-2xl border border-white/8 bg-white/2.5 p-7 hover:bg-white/5 transition-all duration-300">

            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-orange-500/10 mb-6 group-hover:scale-105 transition-transform">
              <img src="/man.gif" width={52} alt="Support from fans"/>
            </div>

            <h3 className="text-xl font-semibold mb-3">
              They believe in you
            </h3>

            <p className="text-gray-400 leading-relaxed text-sm">
              Some people genuinely enjoy your work. Give them a simple way
              to show their support.
            </p>

          </div>

          <div className="group rounded-2xl border border-white/8 bg-white/2.5 p-7 hover:bg-white/5 transition-all duration-300">

            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-orange-500/10 mb-6 group-hover:scale-105 transition-transform">
              <img src="/coin.gif" width={52} alt="Financial contribution"/>
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Every chai counts
            </h3>

            <p className="text-gray-400 leading-relaxed text-sm">
              Small contributions can help pay for tools, ideas, projects,
              and the time it takes to keep creating.
            </p>

          </div>

          <div className="group rounded-2xl border border-white/8 bg-white/2.5 p-7 hover:bg-white/5 transition-all duration-300">

            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-orange-500/10 mb-6 group-hover:scale-105 transition-transform">
              <img src="/group.gif" width={52} alt="Creator community"/>
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Build together
            </h3>

            <p className="text-gray-400 leading-relaxed text-sm">
              Your supporters aren't just an audience. They're part of the
              journey behind the things you create.
            </p>

          </div>

        </div>
      </section>

      <section className="px-6 pb-24">

        <div className="max-w-5xl mx-auto rounded-3xl border border-white/8 bg-linear-to-br from-orange-500/8 to-transparent p-8 sm:p-12">

          <div className="max-w-3xl">

            <div className="text-4xl mb-5">
              ☕
            </div>

            <p className="text-2xl sm:text-3xl font-medium leading-relaxed">
              “Sometimes a little support is all it takes to keep a good idea
              alive.”
            </p>

            <p className="mt-5 text-gray-500">
              — The idea behind The Brew Club
            </p>

          </div>

        </div>

      </section>


      <section className="border-t border-white/8">

        <div className="max-w-6xl mx-auto px-6 py-24">

          <div className="text-center mb-12">

            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest mb-3">
              See it in action
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold">
              Curious how it works?
            </h2>

            <p className="mt-4 text-gray-400">
              Take a quick look and see what The Brew Club is all about.
            </p>

          </div>


          <div className="max-w-4xl mx-auto">

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">

              <iframe className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/ojuUnfqnUI0?si=wMUv4DG3ia6Wt4zn"
                title="The Brew Club introduction video" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
              />

            </div>

          </div>

        </div>

      </section>

      <section className="px-6 py-24">

        <div className="max-w-3xl mx-auto text-center">

          <div className="text-5xl mb-6">
            🫖
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold">
            Got something worth creating?
          </h2>

          <p className="mt-4 text-gray-400 leading-relaxed">
            Start your page, share your work, and let the people who believe
            in you be part of the journey.
          </p>

          <Link href="/login">
            <button
              type="button"
              className="mt-8 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Creating →
            </button>
          </Link>

        </div>

      </section>

    </main>
  );
}
