"use client";
import Link from 'next/link';
import { Roboto } from "next/font/google";
import { motion } from 'framer-motion';

const robotoFont = Roboto({
  subsets: ["latin"],
  weight: "900",
  variable: "--font-roboto",
});

export default function Header() {
  return (
    <div className={`${robotoFont.variable}`}>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full h-72 sm:h-80 bg-cover bg-center text-white flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('/assets/villa.jpg')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* Text content */}
        <div className="relative z-10 max-w-3xl pt-12">
          <Link href="/">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-300 drop-shadow-md mb-3">
              We help you find rental properties tailored to your lifestyle and needs.
            </h1>
          </Link>
        </div>
      </motion.header>
    </div>
  );
}
