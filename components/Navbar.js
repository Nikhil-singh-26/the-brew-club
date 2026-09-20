"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 transition-transform duration-200 group-hover:scale-105">
            <span className="text-xl">☕</span>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">
              The Brew Club
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 sm:block">
              Create · Support · Fuel
            </span>
          </div>
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            How it works
          </Link>

          {session ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-sm text-gray-200 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                {session.user?.profilepic || session.user?.image ? (
                  <img
                    src={session.user?.profilepic || session.user?.image}
                    alt={session.user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-black">
                    {(session.user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="hidden max-w-28 truncate font-medium sm:block">
                  {session.user?.name || "Account"}
                </span>

                <svg
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 h-full w-full"
                    onClick={() => setShowDropdown(false)}
                  />

                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#15151b] shadow-2xl shadow-black/80">
                    <div className="border-b border-white/10 px-4 py-3.5">
                      <p className="truncate text-sm font-semibold text-white">
                        {session.user?.displayName || session.user?.name || "Member"}
                      </p>
                      <p className="truncate text-xs text-amber-400">
                        @{session.user?.name || "user"}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                      >
                        <span>⚙️</span>
                        <div>
                          <p className="font-medium">Dashboard</p>
                          <p className="text-[11px] text-gray-400">
                            Profile & payment settings
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/${session.user?.name}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                      >
                        <span>☕</span>
                        <div>
                          <p className="font-medium">Your Creator Page</p>
                          <p className="text-[11px] text-gray-400">
                            Public supporter link
                          </p>
                        </div>
                      </Link>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <span>🚪</span>
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Log in
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20"
              >
                Join the club
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
