import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata = {
  title: "The Brew Club - Creator Crowdfunding & Direct Supporter Platform",
  description:
    "The Brew Club is a creator-support and community crowdfunding platform where supporters can back their favorite creators, builders, and artists.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0b0f] text-white min-h-screen flex flex-col selection:bg-amber-400 selection:text-black">
        <SessionWrapper>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
