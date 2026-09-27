import React from "react";
import CreatorsList from "@/components/CreatorsList";
import { fetchCreators } from "@/actions/useractions";

export const metadata = {
  title: "Discover Creators - The Brew Club",
  description:
    "Discover creators worth supporting. Explore independent builders, artists, writers, and makers funding their craft through direct community contributions.",
};

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const initialData = await fetchCreators({ skip: 0, limit: 10 });

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white overflow-hidden pb-24">
      {/* Top Ambient Glow */}
      <div className="relative px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-140 h-72 bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-amber-300">
            <span>✨</span>
            Creator Community
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Discover creators{" "}
            <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              worth supporting.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The Brew Club helps you discover passionate builders, makers, and
            artists. Find someone whose work you admire and fuel their craft
            directly.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <CreatorsList
          initialCreators={initialData.creators || []}
          initialTotal={initialData.total || 0}
          initialHasMore={initialData.hasMore || false}
        />
      </div>
    </main>
  );
}
