"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              Creator Climb
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
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
              className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100"
              style={
                { "--text-primary": "var(--primary)" } as React.CSSProperties
              }
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100"
              style={
                { "--text-primary": "var(--primary)" } as React.CSSProperties
              }
            >
              Dashboard
            </Link>
            <Link
              href="/content-ideas"
              className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100"
              style={
                { "--text-primary": "var(--primary)" } as React.CSSProperties
              }
            >
              Content Ideas
            </Link>
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100"
                  style={
                    {
                      "--text-primary": "var(--primary)",
                    } as React.CSSProperties
                  }
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  style={
                    {
                      backgroundColor: "var(--primary)",
                      "--hover-bg": "var(--primary-hover)",
                    } as React.CSSProperties
                  }
                  className="text-white px-4 py-2 rounded-md hover:bg-[var(--hover-bg)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  style={
                    {
                      color: "var(--primary)",
                      borderColor: "var(--primary)",
                      "--hover-bg": "var(--primary-light)",
                    } as React.CSSProperties
                  }
                  className="border px-4 py-2 rounded-md hover:bg-[var(--hover-bg)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  style={
                    {
                      backgroundColor: "var(--primary)",
                      "--hover-bg": "var(--primary-hover)",
                    } as React.CSSProperties
                  }
                  className="text-white px-4 py-2 rounded-md hover:bg-[var(--hover-bg)]"
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
                className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100 py-2"
                style={
                  { "--text-primary": "var(--primary)" } as React.CSSProperties
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100 py-2"
                style={
                  { "--text-primary": "var(--primary)" } as React.CSSProperties
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/content-ideas"
                className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100 py-2"
                style={
                  { "--text-primary": "var(--primary)" } as React.CSSProperties
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Content Ideas
              </Link>
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary hover:text-opacity-100 py-2"
                    style={
                      {
                        "--text-primary": "var(--primary)",
                      } as React.CSSProperties
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    style={
                      {
                        backgroundColor: "var(--primary)",
                        "--hover-bg": "var(--primary-hover)",
                      } as React.CSSProperties
                    }
                    className="text-white px-4 py-2 rounded-md hover:bg-[var(--hover-bg)] text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/login"
                    style={
                      {
                        color: "var(--primary)",
                        borderColor: "var(--primary)",
                        "--hover-bg": "var(--primary-light)",
                      } as React.CSSProperties
                    }
                    className="border px-4 py-2 rounded-md hover:bg-[var(--hover-bg)] text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    style={
                      {
                        backgroundColor: "var(--primary)",
                        "--hover-bg": "var(--primary-hover)",
                      } as React.CSSProperties
                    }
                    className="text-white px-4 py-2 rounded-md hover:bg-[var(--hover-bg)] text-center"
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
