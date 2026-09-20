import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import "./globals.css";

export const metadata = {
  title: "The-Brew-Club",
  description: "This website is a crowdfunding platform for creaters",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="min-h-[89vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
