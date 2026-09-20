import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-1">
        
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-wide">
              ☕ The Brew Club
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Brewing good moments, one cup at a time.
            </p>
          </div>

        <div className="my-4 h-px bg-gray-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>
            © {currentYear} The Brew Club. All rights reserved.
            </p>
            <p>
            Made with <span className="text-red-400">♥</span> and lots of{" "}
            <span className="text-amber-400">☕</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;