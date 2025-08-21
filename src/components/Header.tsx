"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-orange-500 shadow-md border-b border-orange-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <Image
                src="/favicons/android-chrome-192x192.png"
                alt="Creator Climb Logo"
                width={28}
                height={28}
                className="mr-2"
              />
              Creator Climb
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-orange-200 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-orange-200 transition-colors duration-200"
            >
              Dashboard
            </Link>
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-white hover:text-orange-200 transition-colors duration-200"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-orange-100 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-orange-500 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-orange-100 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-white hover:text-orange-200 transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-white hover:text-orange-200 transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="text-white hover:text-orange-200 transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-orange-100 transition-colors duration-200 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/login"
                    className="text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-orange-500 transition-colors duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-orange-100 transition-colors duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
