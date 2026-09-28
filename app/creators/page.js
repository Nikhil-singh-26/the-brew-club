import React from "react";
import CreatorsList from "@/components/CreatorsList";
import { fetchCreators } from "@/actions/useractions";

export const metadata = {
  title: "Discover Creators — The Brew Club",
  description:
    "Discover creators worth supporting. Explore independent builders, artists, writers, and makers funding their craft through direct community contributions.",
};

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const initialData = await fetchCreators({ skip: 0, limit: 10 });

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A] pb-24">
      {/* Header */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#F5E8E0] text-[#C86B3C] text-xs font-semibold uppercase tracking-wider">
            Directory
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-[#1E1D1A]">
            Discover creators
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A60] max-w-xl leading-relaxed">
            Find people building, experimenting, and creating things worth supporting. Browse independent makers and developers.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <CreatorsList
          initialCreators={initialData.creators || []}
          initialTotal={initialData.total || 0}
          initialHasMore={initialData.hasMore || false}
        />
      </div>
    </main>
  );
}
