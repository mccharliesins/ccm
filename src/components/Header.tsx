"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 shadow-md border-b border-orange-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <svg
                className="h-6 w-6 text-orange-500 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C10.97 2 9.94 2.28 9.01 2.84L9 2.85C8.61 3.06 8.25 3.31 7.93 3.59C7.86 3.65 7.8 3.71 7.73 3.77C7.68 3.81 7.63 3.86 7.58 3.9C7.5 3.97 7.42 4.05 7.35 4.12C7.27 4.2 7.19 4.28 7.12 4.36C7.06 4.43 7 4.5 6.94 4.57C6.88 4.65 6.82 4.72 6.76 4.8C6.7 4.88 6.65 4.96 6.6 5.05C6.55 5.13 6.5 5.21 6.46 5.3C6.4 5.42 6.35 5.55 6.3 5.68C6.27 5.76 6.24 5.84 6.21 5.93C6.18 6.01 6.15 6.1 6.13 6.19C6.1 6.32 6.07 6.46 6.05 6.59C6.02 6.75 6 6.92 6 7.09C6 7.12 6 7.16 6 7.19C6 7.23 6 7.26 6 7.3C6 7.69 6.06 8.08 6.17 8.45C6.19 8.53 6.21 8.61 6.23 8.68C6.25 8.75 6.27 8.82 6.3 8.89C6.33 8.96 6.35 9.04 6.38 9.11C6.4 9.17 6.43 9.24 6.46 9.3C6.49 9.37 6.53 9.44 6.56 9.5C6.59 9.56 6.63 9.62 6.67 9.68C6.71 9.74 6.74 9.8 6.78 9.86C6.82 9.92 6.87 9.98 6.91 10.04C6.95 10.09 7 10.15 7.04 10.2C7.09 10.26 7.13 10.31 7.18 10.36C7.23 10.42 7.28 10.47 7.33 10.52C7.39 10.58 7.44 10.63 7.5 10.68C7.55 10.73 7.61 10.78 7.67 10.83C7.73 10.88 7.79 10.93 7.85 10.97C7.91 11.02 7.97 11.06 8.04 11.1C8.1 11.14 8.16 11.18 8.23 11.22C8.29 11.26 8.36 11.3 8.43 11.33C8.5 11.37 8.57 11.4 8.64 11.43C8.71 11.47 8.78 11.5 8.85 11.53C8.92 11.56 8.99 11.59 9.07 11.61C9.14 11.64 9.21 11.66 9.29 11.69C9.36 11.71 9.44 11.73 9.51 11.75C9.59 11.77 9.67 11.79 9.74 11.8C9.82 11.82 9.9 11.83 9.98 11.85C10.06 11.86 10.14 11.87 10.22 11.88C10.3 11.89 10.38 11.9 10.46 11.9C10.54 11.91 10.62 11.91 10.7 11.91C10.78 11.91 10.86 11.91 10.94 11.91C11.02 11.91 11.1 11.9 11.18 11.9C11.26 11.89 11.34 11.89 11.42 11.88C11.5 11.87 11.58 11.86 11.66 11.85C11.74 11.83 11.82 11.82 11.9 11.8C11.98 11.79 12.05 11.77 12.13 11.75C12.21 11.73 12.28 11.71 12.36 11.69C12.43 11.66 12.51 11.64 12.58 11.61C12.65 11.59 12.73 11.56 12.8 11.53C12.87 11.5 12.94 11.47 13.01 11.43C13.08 11.4 13.15 11.37 13.22 11.33C13.29 11.3 13.36 11.26 13.42 11.22C13.49 11.18 13.55 11.14 13.62 11.1C13.68 11.06 13.74 11.02 13.8 10.97C13.86 10.93 13.92 10.88 13.98 10.83C14.04 10.78 14.1 10.73 14.15 10.68C14.21 10.63 14.26 10.58 14.32 10.52C14.37 10.47 14.42 10.42 14.47 10.36C14.52 10.31 14.56 10.26 14.61 10.2C14.65 10.15 14.7 10.09 14.74 10.04C14.78 9.98 14.83 9.92 14.87 9.86C14.91 9.8 14.94 9.74 14.98 9.68C15.02 9.62 15.06 9.56 15.09 9.5C15.12 9.44 15.16 9.37 15.19 9.3C15.22 9.24 15.25 9.17 15.27 9.11C15.3 9.04 15.32 8.96 15.35 8.89C15.38 8.82 15.4 8.75 15.42 8.68C15.44 8.61 15.46 8.53 15.48 8.45C15.59 8.08 15.65 7.69 15.65 7.3C15.65 7.26 15.65 7.23 15.65 7.19C15.65 7.16 15.65 7.12 15.65 7.09C15.65 6.92 15.63 6.75 15.6 6.59C15.58 6.46 15.55 6.32 15.52 6.19C15.5 6.1 15.47 6.01 15.44 5.93C15.41 5.84 15.38 5.76 15.35 5.68C15.3 5.55 15.25 5.42 15.19 5.3C15.15 5.21 15.1 5.13 15.05 5.05C15 4.96 14.95 4.88 14.89 4.8C14.83 4.72 14.77 4.65 14.71 4.57C14.65 4.5 14.59 4.43 14.53 4.36C14.46 4.28 14.38 4.2 14.3 4.12C14.23 4.05 14.15 3.97 14.07 3.9C14.02 3.86 13.97 3.81 13.92 3.77C13.85 3.71 13.79 3.65 13.72 3.59C13.4 3.31 13.04 3.06 12.65 2.85L12.64 2.84C11.71 2.28 10.68 2 9.65 2H12Z" />
              </svg>
              Creator Climb
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 focus:outline-none"
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
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/content-ideas"
              className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
            >
              Content Ideas
            </Link>
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="text-orange-500 border border-orange-500 px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
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
                className="text-gray-300 hover:text-orange-400 transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-orange-400 transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/content-ideas"
                className="text-gray-300 hover:text-orange-400 transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Content Ideas
              </Link>
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/login"
                    className="text-orange-500 border border-orange-500 px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 text-center"
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
