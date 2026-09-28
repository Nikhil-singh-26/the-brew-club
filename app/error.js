"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#F7F4EE] text-[#1E1D1A]">
      <div className="h-14 w-14 rounded-[10px] bg-[#B8544B]/10 text-[#B8544B] text-2xl flex items-center justify-center mb-4 border border-[#B8544B]/20 shadow-xs">
        ⚠️
      </div>

      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>

      <p className="mt-2 text-xs text-[#6F6A60] max-w-sm">
        We couldn&apos;t load this page. Please try refreshing or return to the home page.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] hover:bg-[#F0ECE4] px-4 py-2 text-xs font-medium text-[#1E1D1A] shadow-xs transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
