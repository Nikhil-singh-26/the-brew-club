import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#34322C] bg-[#171613] text-[#AAA59A]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#F4F0E8] font-heading font-semibold text-sm">
              <span className="text-[#C96F43]">☕</span>
              <span>The Brew Club</span>
            </div>
            <p className="text-xs text-[#77736B]">
              Brewing good moments, one cup at a time. Direct creator support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#AAA59A]">
            <Link href="/" className="hover:text-[#F4F0E8] transition">
              Home
            </Link>
            <Link href="/creators" className="hover:text-[#F4F0E8] transition">
              Explore creators
            </Link>
            <Link href="/about" className="hover:text-[#F4F0E8] transition">
              About
            </Link>
            <Link href="/login" className="hover:text-[#F4F0E8] transition">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-[#F4F0E8] transition">
              Workspace
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#25241F] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#77736B]">
          <p>© {currentYear} The Brew Club. An independent platform for creators and supporters.</p>
          <p className="text-[#77736B]">
            Crafted for makers who build in the open.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;