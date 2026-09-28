import { Instrument_Sans, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "The Brew Club — Independent Creator Support & Community Platform",
  description:
    "A direct creator-support platform where people can back the builders, writers, and makers they admire.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${inter.variable}`}>
      <body className="bg-[#171613] text-[#F4F0E8] min-h-screen flex flex-col antialiased selection:bg-[#C96F43] selection:text-[#171613]">
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
