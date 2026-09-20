import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#07070a] text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">
              ☕
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                The Brew Club
              </p>
              <p className="text-xs text-gray-500">
                Direct community crowdfunding for creators and builders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/about" className="hover:text-white transition">
              About
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="my-6 h-px bg-white/5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {currentYear} The Brew Club. All rights reserved.</p>
          <p>
            Built for creators with <span className="text-rose-400">♥</span> and{" "}
            <span className="text-amber-400">☕</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;