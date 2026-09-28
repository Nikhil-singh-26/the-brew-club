"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CreatorCard from "./CreatorCard";
import { fetchCreators } from "@/actions/useractions";
import Link from "next/link";

const CreatorsList = ({
  initialCreators = [],
  initialTotal = 0,
  initialHasMore = false,
}) => {
  const [creators, setCreators] = useState(initialCreators);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const isFirstMount = useRef(true);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute search when debounced search term updates
  const executeSearch = useCallback(async (query) => {
    setSearching(true);
    try {
      const res = await fetchCreators({
        search: query,
        skip: 0,
        limit: 10,
      });

      if (res.success) {
        setCreators(res.creators || []);
        setTotal(res.total || 0);
        setHasMore(res.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to search creators:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    executeSearch(debouncedSearch);
  }, [debouncedSearch, executeSearch]);

  // Load more creators
  const handleViewMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextSkip = creators.length;
      const res = await fetchCreators({
        search: debouncedSearch,
        skip: nextSkip,
        limit: 10,
      });

      if (res.success) {
        setCreators((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newUnique = (res.creators || []).filter(
            (c) => !existingIds.has(c._id)
          );
          return [...prev, ...newUnique];
        });
        setTotal(res.total || 0);
        setHasMore(res.hasMore || false);
      }
    } catch (error) {
      console.error("Failed to load more creators:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    <div className="w-full">
      {/* Search Bar Section */}
      <div className="mx-auto max-w-2xl mb-12">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>

          <input
            type="text"
            id="search-creators-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators by name, username, or craft..."
            className="w-full rounded-2xl border border-white/10 bg-white/4 py-4 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-amber-400/60 focus:bg-black/60 focus:ring-4 focus:ring-amber-400/10 shadow-lg"
          />

          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition"
              title="Clear search"
              aria-label="Clear search"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                ✕
              </span>
            </button>
          )}
        </div>

        {/* Search status indicator */}
        <div className="mt-3 flex items-center justify-between px-2 text-xs text-gray-500">
          <div>
            {searching ? (
              <span className="flex items-center gap-2 text-amber-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
                Searching creators...
              </span>
            ) : debouncedSearch ? (
              <span>
                Results for &quot;
                <span className="text-gray-300 font-medium">{debouncedSearch}</span>
                &quot; ({total} found)
              </span>
            ) : (
              <span>Showing {creators.length} of {total} creators</span>
            )}
          </div>

          {debouncedSearch && (
            <button
              onClick={handleClearSearch}
              className="text-amber-400 hover:underline transition text-xs"
            >
              Reset search
            </button>
          )}
        </div>
      </div>

      {/* Creators Grid */}
      {creators.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={creator._id || creator.username} creator={creator} />
            ))}
          </div>

          {/* View More / End of List State */}
          <div className="mt-14 flex flex-col items-center justify-center text-center">
            {hasMore ? (
              <button
                type="button"
                onClick={handleViewMore}
                disabled={loadingMore}
                className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-amber-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/10 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
                    <span>Loading more creators...</span>
                  </>
                ) : (
                  <>
                    <span>View More</span>
                    <span className="text-amber-400 transition-transform duration-200 group-hover:translate-y-0.5">
                      ↓
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400/40" />
                <span>You&apos;ve reached the end.</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400/40" />
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/2 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl mb-4">
            {debouncedSearch ? "🔍" : "☕"}
          </div>

          <h3 className="text-lg font-bold text-white">
            {debouncedSearch
              ? `No creators found for "${debouncedSearch}"`
              : "No creators registered yet"}
          </h3>

          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            {debouncedSearch
              ? "We couldn't find any creator matching your search term. Try checking for typos or searching with different keywords."
              : "Be among the first creators to set up a profile, share your journey, and receive supporter backing on The Brew Club."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {debouncedSearch ? (
              <button
                onClick={handleClearSearch}
                className="rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-xs font-bold text-black transition hover:opacity-95"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/join"
                className="rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-xs font-bold text-black transition hover:opacity-95"
              >
                Start Your Creator Page →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorsList;
