"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#34322C] bg-[#171613]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-[#F4F0E8] transition hover:opacity-90">
            <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#282721] border border-[#34322C] text-[#C96F43] text-sm font-semibold">
              ☕
            </span>
            <span className="font-heading text-base font-semibold tracking-tight text-[#F4F0E8]">
              The Brew Club
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-normal">
            <Link
              href="/creators"
              className={`transition ${
                pathname === "/creators"
                  ? "text-[#C96F43] font-semibold"
                  : "text-[#AAA59A] hover:text-[#F4F0E8]"
              }`}
            >
              Explore creators
            </Link>
            <Link
              href="/about"
              className={`transition ${
                pathname === "/about"
                  ? "text-[#C96F43] font-semibold"
                  : "text-[#AAA59A] hover:text-[#F4F0E8]"
              }`}
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-[7px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1.5 text-xs text-[#F4F0E8] transition hover:border-[#48453D] hover:bg-[#282721] cursor-pointer"
              >
                {session.user?.profilepic ? (
                  <img
                    src={session.user.profilepic}
                    alt={session.user?.displayName || session.user?.name || "Avatar"}
                    className="h-5 w-5 rounded-[4px] object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#282721] text-[11px] font-bold text-[#C96F43]">
                    {(session.user?.displayName || session.user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="max-w-28 truncate font-medium text-[#F4F0E8]">
                  {session.user?.name || "Account"}
                </span>

                <svg
                  className={`h-3 w-3 text-[#AAA59A] transition-transform duration-150 ${
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

                  <div className="absolute right-0 top-10 z-50 w-56 rounded-[8px] border border-[#34322C] bg-[#201F1B] py-1 shadow-lg">
                    <div className="border-b border-[#34322C] px-3.5 py-2.5">
                      <p className="truncate text-xs font-semibold text-[#F4F0E8]">
                        {session.user?.displayName || session.user?.name}
                      </p>
                      <p className="truncate text-[11px] text-[#AAA59A]">
                        @{session.user?.name}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#AAA59A] hover:bg-[#282721] hover:text-[#F4F0E8] transition"
                      >
                        <span>Workspace</span>
                      </Link>

                      <Link
                        href={`/${session.user?.name}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#AAA59A] hover:bg-[#282721] hover:text-[#F4F0E8] transition"
                      >
                        <span>View your page</span>
                      </Link>

                      <Link
                        href="/creators"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#AAA59A] hover:bg-[#282721] hover:text-[#F4F0E8] transition"
                      >
                        <span>Explore creators</span>
                      </Link>

                      <div className="my-1 border-t border-[#34322C]" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#C85C52] hover:bg-[#282721] transition cursor-pointer"
                      >
                        <span>Sign out</span>
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
                className="text-xs font-medium text-[#AAA59A] hover:text-[#F4F0E8] transition px-2 py-1"
              >
                Log in
              </Link>

              <Link
                href="/join"
                className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#B55E34] px-3.5 py-1.5 text-xs font-semibold text-[#171613] transition shadow-xs"
              >
                Join the club
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
