"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#0b0b0f] text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-3xl mb-6">
        ⚠️
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">
        Something went wrong
      </h1>

      <p className="mt-3 text-sm text-gray-400 max-w-md">
        An unexpected error occurred while processing this page.
      </p>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition hover:opacity-95"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
