"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CreatorCard from "./CreatorCard";
import { fetchCreators } from "@/actions/useractions";
import Link from "next/link";

const SKILL_FILTERS = [
  "All",
  "Next.js",
  "React",
  "Node.js",
  "TypeScript",
  "AI",
  "UI/UX",
  "Python",
];

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
  const [selectedSkill, setSelectedSkill] = useState("All");
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

  // Execute search when debounced search term or skill filter updates
  const executeSearch = useCallback(async (query, skill) => {
    setSearching(true);
    try {
      const res = await fetchCreators({
        search: query,
        skill: skill === "All" ? "" : skill,
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

    executeSearch(debouncedSearch, selectedSkill);
  }, [debouncedSearch, selectedSkill, executeSearch]);

  // Load more creators
  const handleViewMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextSkip = creators.length;
      const res = await fetchCreators({
        search: debouncedSearch,
        skill: selectedSkill === "All" ? "" : selectedSkill,
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
    setSelectedSkill("All");
  };

  return (
    <div className="w-full">
      {/* Search & Filter Bar */}
      <div className="mx-auto max-w-2xl mb-10">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#918B80]">
            <svg
              className="h-4 w-4"
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
            placeholder="Search creators by name, handle, stack, or bio..."
            className="w-full rounded-[8px] border border-[#DED8CE] bg-[#FFFFFF] py-3 pl-10 pr-10 text-sm text-[#1E1D1A] shadow-xs outline-none transition placeholder:text-[#918B80] focus:border-[#C86B3C] focus:ring-2 focus:ring-[#C86B3C]/20"
          />

          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#918B80] hover:text-[#1E1D1A] transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#F0ECE4] text-xs">
                ✕
              </span>
            </button>
          )}
        </div>

        {/* Skill Filter Chips */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#918B80] mr-1 shrink-0 font-medium">Filter:</span>
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSelectedSkill(skill)}
              className={`rounded-[6px] px-2.5 py-1 text-xs font-medium transition shrink-0 cursor-pointer shadow-xs ${
                selectedSkill === skill
                  ? "bg-[#C86B3C] text-white border border-[#C86B3C]"
                  : "bg-[#FFFFFF] border border-[#DED8CE] text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4]"
              }`}
            >
              {skill === "All" ? "All Skills" : skill}
            </button>
          ))}
        </div>

        {/* Search Status / Active filter note */}
        <div className="mt-3 flex items-center justify-between px-1 text-xs text-[#6F6A60]">
          <div>
            {searching ? (
              <span className="flex items-center gap-2 text-[#C86B3C]">
                <span className="h-3 w-3 animate-spin rounded-full border border-[#C86B3C]/30 border-t-[#C86B3C]" />
                Searching creators...
              </span>
            ) : debouncedSearch || selectedSkill !== "All" ? (
              <span>
                Found {total} {total === 1 ? "creator" : "creators"} for &ldquo;
                <span className="text-[#1E1D1A] font-semibold">
                  {debouncedSearch || selectedSkill}
                </span>
                &rdquo;
              </span>
            ) : (
              <span>Showing {creators.length} of {total} creators</span>
            )}
          </div>

          {(debouncedSearch || selectedSkill !== "All") && (
            <button
              onClick={handleClearSearch}
              className="text-[#C86B3C] hover:text-[#A9552F] transition text-xs cursor-pointer font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Creators Grid */}
      {creators.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={creator._id || creator.username} creator={creator} />
            ))}
          </div>

          {/* View More / End of Directory */}
          <div className="mt-14 flex flex-col items-center justify-center text-center">
            {hasMore ? (
              <button
                type="button"
                onClick={handleViewMore}
                disabled={loadingMore}
                className="group inline-flex items-center gap-2 rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] px-6 py-2.5 text-xs font-medium text-[#1E1D1A] shadow-xs transition hover:bg-[#F0ECE4] hover:border-[#C5BDB0] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-[#1E1D1A]/30 border-t-[#C86B3C]" />
                    <span>Loading creators...</span>
                  </>
                ) : (
                  <>
                    <span>View more creators</span>
                    <span className="text-[#C86B3C] transition-transform duration-200 group-hover:translate-y-0.5">
                      ↓
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-[#918B80]">
                You&apos;ve reached the end of the creator directory.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="mx-auto max-w-md rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#F5E8E0] text-xl mb-3 text-[#C86B3C]">
            ☕
          </div>

          <h3 className="font-heading text-base font-bold text-[#1E1D1A]">
            {debouncedSearch || selectedSkill !== "All"
              ? "No matching creators found"
              : "No creators registered yet"}
          </h3>

          <p className="mt-2 text-xs text-[#6F6A60] leading-relaxed">
            {debouncedSearch || selectedSkill !== "All"
              ? "We couldn't find any creators matching your search. Try broadening your query or selecting another skill."
              : "Be the first creator to launch your portfolio page and receive backing from supporters."}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {debouncedSearch || selectedSkill !== "All" ? (
              <button
                onClick={handleClearSearch}
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition cursor-pointer"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/join"
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
              >
                Start your creator page →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorsList;
