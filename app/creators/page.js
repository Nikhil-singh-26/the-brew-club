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
    <main className="min-h-screen bg-[#171613] text-[#F4F0E8] pb-24">
      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-[#F4F0E8]">
            Discover creators
          </h1>
          <p className="text-sm text-[#AAA59A] max-w-xl leading-relaxed">
            Find people building things worth supporting. Browse independent makers, developers, and writers.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <CreatorsList
          initialCreators={initialData.creators || []}
          initialTotal={initialData.total || 0}
          initialHasMore={initialData.hasMore || false}
        />
      </div>
    </main>
  );
}
