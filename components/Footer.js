import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#DED8CE] bg-[#F0ECE4] text-[#6F6A60]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#1E1D1A] font-heading font-bold text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#FFFFFF] border border-[#DED8CE] text-[#C86B3C] text-xs">
                ☕
              </span>
              <span>The Brew Club</span>
            </div>
            <p className="text-xs text-[#6F6A60]">
              Brewing good moments, one cup at a time. Direct creator crowdfunding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#6F6A60]">
            <Link href="/" className="hover:text-[#1E1D1A] transition-colors">
              Home
            </Link>
            <Link href="/creators" className="hover:text-[#1E1D1A] transition-colors">
              Explore creators
            </Link>
            <Link href="/about" className="hover:text-[#1E1D1A] transition-colors">
              About
            </Link>
            <Link href="/login" className="hover:text-[#1E1D1A] transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-[#1E1D1A] transition-colors">
              Workspace
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#DED8CE]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#918B80]">
          <p>© {currentYear} The Brew Club. Built for makers and supporters.</p>
          <p className="text-[#918B80]">
            Empowering independent creative work.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;