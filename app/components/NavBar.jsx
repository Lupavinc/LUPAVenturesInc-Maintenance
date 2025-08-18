"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  DownloadIcon,
  LogIn,
  UserPlus,
  User,
  Users,
  Home,
  LayoutList,
} from "lucide-react";

export default function NavBar() {
  const { userId, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/get-user-role?userId=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.role) setRole(json.role);
      })
      .catch((err) => console.error("Failed getting role:", err));
  }, [userId]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      className="text-yellow-300 py-5 px-6 bg-[#19211F]"
    >
      {/* Top Section */}
      <section className="w-full flex justify-between items-center text-lg font-medium h-[80px] bg-[#19221F] px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center h-full mr-16">
          <img
            src="/assets/Lupa.svg"
            alt="Lupa Ventures Logo"
            className="h-[100px] w-auto"
          />
        </Link>

        {/* Desktop Navigation (Admin Only) */}
        {role === "admin" && (
          <div className="hidden md:flex flex-wrap items-center space-x-4 md:space-x-6 text-yellow-300">
            <Link href="/" title = "Go to Homepage" className="flex items-center hover:text-white transition">
              <Home size={20} className="mr-2" /> Home
            </Link>

            <Link
              href="/dashboard" title = "Receipt Entry and Updates" // Change to /admin/receipts if needed
              className="flex items-center hover:text-white transition"
            >
              <LayoutList size={20} className="mr-2" />
              Receipt Maintenance
            </Link>
            <Link href="/dashboard/transactions/export" title = "Export as CSV or Excel" className="flex items-center hover:text-white transition">
              <DownloadIcon size={20} className="mr-2" /> Report Export
            </Link>
            <Link href="/admin/user-roles" title="Manage User Roles and Permissions" className="flex items-center hover:text-white transition">
              <Users size={20} className="mr-2" /> User Role Maintenance
            </Link>
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          {!userId ? (
            <>
              <Link href="/sign-in" title="Sign in to your account" className="flex items-center hover:text-white transition">
                <LogIn size={20} className="mr-2" /> Sign in
              </Link>
              <Link href="/sign-up" title="Create a new account" className="flex items-center hover:text-white transition">
                <UserPlus size={20} className="mr-2" /> Sign up
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" title="View your profile" className="flex items-center hover:text-white transition">
                <User size={20} className="mr-2" /> Profile
              </Link>
              <button
                onClick={() => {
                  signOut();
                  closeMenu();
                }}
                className="flex items-center hover:text-white transition"
              >
                <LogIn size={20} className="mr-2 rotate-180" /> Sign out
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-yellow-300"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </section>

      {/* Mobile Navigation (Admin Only) */}
      <AnimatePresence>
        {isOpen && role === "admin" && (
          <motion.section
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden mt-4 flex flex-col items-center gap-4 text-lg font-medium text-yellow-300 overflow-hidden"
          >
            <Link href="/" onClick={closeMenu} className="flex items-center hover:text-white transition">
              <Home size={20} className="mr-2" /> Home
            </Link>

            <Link
              href="/dashboard" // Change to /admin/receipts if needed
              onClick={closeMenu}
              className="flex items-center hover:text-white transition"
            >
              <LayoutList size={20} className="mr-2" /> Receipt Maintenance
            </Link>
            <Link href="/dashboard/transactions/export" onClick={closeMenu} className="flex items-center hover:text-white transition">
              <DownloadIcon size={20} className="mr-2" /> Report Export
            </Link>
            <Link href="/admin/user-roles" onClick={closeMenu} className="flex items-center hover:text-white transition">
              <Users size={20} className="mr-2" /> User Role Maintenance
            </Link>
            {/* Auth Buttons Mobile */}
            {!userId ? (
              <>
                <Link href="/sign-in" onClick={closeMenu} className="flex items-center hover:text-white transition">
                  <LogIn size={20} className="mr-2" /> Sign in
                </Link>
                <Link href="/sign-up" onClick={closeMenu} className="flex items-center hover:text-white transition">
                  <UserPlus size={20} className="mr-2" /> Sign up
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" onClick={closeMenu} className="flex items-center hover:text-white transition">
                  <User size={20} className="mr-2" /> Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="flex items-center hover:text-white transition"
                >
                  <LogIn size={20} className="mr-2 rotate-180" /> Sign out
                </button>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
