"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#DED8CE] bg-[#F7F4EE]/90 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5 transition">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#FFFFFF] border border-[#DED8CE] shadow-xs text-[#C86B3C] text-sm font-semibold transition-transform duration-200 group-hover:scale-105">
              ☕
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-[#1E1D1A]">
              The Brew Club
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-normal">
            <Link
              href="/creators"
              className={`transition-colors duration-150 ${
                pathname === "/creators"
                  ? "text-[#C86B3C] font-semibold"
                  : "text-[#6F6A60] hover:text-[#1E1D1A]"
              }`}
            >
              Explore creators
            </Link>
            <Link
              href="/about"
              className={`transition-colors duration-150 ${
                pathname === "/about"
                  ? "text-[#C86B3C] font-semibold"
                  : "text-[#6F6A60] hover:text-[#1E1D1A]"
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
                className="flex items-center gap-2 rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#1E1D1A] shadow-xs transition hover:border-[#C5BDB0] hover:bg-[#F0ECE4] cursor-pointer"
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
                  <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#F5E8E0] text-[11px] font-bold text-[#C86B3C]">
                    {(session.user?.displayName || session.user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="max-w-28 truncate font-medium text-[#1E1D1A]">
                  {session.user?.name || "Account"}
                </span>

                <svg
                  className={`h-3 w-3 text-[#6F6A60] transition-transform duration-150 ${
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

                  <div className="absolute right-0 top-10 z-50 w-56 rounded-[8px] border border-[#DED8CE] bg-[#FFFFFF] py-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="border-b border-[#DED8CE] px-3.5 py-2.5">
                      <p className="truncate text-xs font-semibold text-[#1E1D1A]">
                        {session.user?.displayName || session.user?.name}
                      </p>
                      <p className="truncate text-[11px] text-[#6F6A60]">
                        @{session.user?.name}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#6F6A60] hover:bg-[#F0ECE4] hover:text-[#1E1D1A] transition"
                      >
                        <span>Creator Workspace</span>
                      </Link>

                      <Link
                        href={`/${session.user?.name}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#6F6A60] hover:bg-[#F0ECE4] hover:text-[#1E1D1A] transition"
                      >
                        <span>View Public Page</span>
                      </Link>

                      <Link
                        href="/creators"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#6F6A60] hover:bg-[#F0ECE4] hover:text-[#1E1D1A] transition"
                      >
                        <span>Explore Creators</span>
                      </Link>

                      <div className="my-1 border-t border-[#DED8CE]" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[#B8544B] hover:bg-[#F5E8E0] transition cursor-pointer"
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
                className="text-xs font-medium text-[#6F6A60] hover:text-[#1E1D1A] transition px-2 py-1"
              >
                Log in
              </Link>

              <Link
                href="/join"
                className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] px-3.5 py-1.5 text-xs font-medium text-white transition shadow-xs hover:shadow-sm"
              >
                Start creating
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] text-[#6F6A60] hover:text-[#1E1D1A]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DED8CE] bg-[#F7F4EE] px-4 py-3 space-y-2">
          <Link
            href="/creators"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-[#6F6A60] hover:text-[#1E1D1A] py-1.5"
          >
            Explore creators
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-[#6F6A60] hover:text-[#1E1D1A] py-1.5"
          >
            About The Brew Club
          </Link>
          {!session && (
            <div className="pt-2 border-t border-[#DED8CE] flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-medium text-[#6F6A60] py-1"
              >
                Log in
              </Link>
              <span className="text-[#918B80]">·</span>
              <Link
                href="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold text-[#C86B3C] py-1"
              >
                Join the club
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
