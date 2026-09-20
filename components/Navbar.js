"use client"

import React, { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

const Navbar = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">

        <Link href="/"
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 transition-transform duration-200 group-hover:scale-105">
            <span className="text-lg">☕</span>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[17px] font-semibold tracking-tight text-white">
              The Brew Club
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500 sm:block">
              Create · Support · Belong
            </span>
          </div>
        </Link>


        <div className="flex items-center gap-2">

          {session ? (
            <div className="relative">

              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-sm text-gray-200 transition-all duration-200 hover:border-white/20 hover:bg-white/9"
              >

                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-sm font-semibold text-black">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

        
                <span className="hidden max-w-28 truncate sm:block">
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
                 
                  <button
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 h-full w-full cursor-default"
                    onClick={() => setShowDropdown(false)}
                  />

                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#15151b] shadow-2xl shadow-black/40">

                   
                    <div className="border-b border-white/10 px-4 py-4">
                      <div className="flex items-center gap-3">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 font-semibold text-black">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {session.user?.name || "Member"}
                          </p>

                          {session.user?.email && (
                            <p className="truncate text-xs text-gray-500">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                 
                    <div className="p-2">

                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/6 hover:text-white"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                          </svg>
                        </span>

                        <div>
                          <p className="font-medium">Dashboard</p>
                          <p className="text-xs text-gray-500">
                            Manage your account
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/${session.user?.name}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/6 hover:text-white"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 21a8 8 0 00-16 0" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>

                        <div>
                          <p className="font-medium">Your page</p>
                          <p className="text-xs text-gray-500">
                            View your creator profile
                          </p>
                        </div>
                      </Link>

                      <div className="my-2 border-t border-white/10" />

                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            viewBox="0 0 24 24"
                          >
                            <path d="M10 17l5-5-5-5" />
                            <path d="M15 12H3" />
                            <path d="M21 3v18" />
                          </svg>
                        </span>

                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >Log in
              </Link>

              <Link href="/login"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200 hover:shadow-lg hover:shadow-white/10"
              >Join the club
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
