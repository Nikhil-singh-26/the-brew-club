import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata = {
  title: "The-Brew-Club",
  description: "Discover great chai, share your passion for brewing, and connect with fellow chai lovers at The Brew Club.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-size-[20px_20px] text-white">
        <SessionWrapper>
          <Navbar />
            <div className=" min-h-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-size-[20px_20px] text-white">
              {children}
            </div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
