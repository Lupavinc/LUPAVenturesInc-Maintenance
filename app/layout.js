import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { ClerkProvider } from "@clerk/nextjs";

const roboto = Roboto({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "LUPA Ventures Inc.",
  description: "LUPA Online Platform",
  icons: {
    icon: "/Logo-lupa.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.className} flex flex-col min-h-screen bg-white`}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <NavBar />
          <Header />
          <main className="flex-grow flex flex-col items-center justify-start w-full px-4 py-4">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
