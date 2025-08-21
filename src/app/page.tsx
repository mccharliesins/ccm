"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Particles component for the dust animation
const ParticleAnimation = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      width: number;
      height: number;
      left: string;
      top: string;
      opacity: number;
      animationDuration: number;
      animationDelay: number;
      pulseDuration: number;
    }>
  >([]);

  useEffect(() => {
    const particlesArray = Array.from({ length: 50 }, (_, index) => ({
      id: index,
      width: Math.random() * 6 + 2,
      height: Math.random() * 6 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.3,
      animationDuration: Math.random() * 10 + 10,
      animationDelay: Math.random() * 5,
      pulseDuration: Math.random() * 2 + 2,
    }));

    setParticles(particlesArray);
  }, []);

  return (
    <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full bg-orange-100"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
            animation: `float ${particle.animationDuration}s linear infinite, 
                      pulse ${particle.pulseDuration}s ease-in-out infinite`,
            animationDelay: `${particle.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-white to-orange-50 overflow-hidden min-h-screen">
        {/* Particle Animation */}
        <ParticleAnimation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-40 lg:pb-28">
            <div className="text-center">
              <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
                <span className="block">Content Creation.</span>
                <span className="block text-orange-500">Reimagined.</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                The ultimate tool to help creators focus on what matters and
                discover trending ideas that resonate with your audience.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                <div className="rounded-md shadow">
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 md:py-4 md:text-lg md:px-10 transition-all"
                  >
                    Get started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 md:py-4 md:text-lg md:px-10 transition-all"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hidden sm:block absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-full text-orange-100"
            height="120"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Elevate Your Content Strategy
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Creator Climb provides powerful tools to help you grow your
              channel and engage your audience.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 bg-orange-50 p-6">
                  <div className="h-12 w-12 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Content Ideas
                    </h3>
                    <p className="mt-3 text-base text-gray-500">
                      Discover trending topics and content ideas tailored to
                      your audience and niche.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 bg-orange-50 p-6">
                  <div className="h-12 w-12 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Similar Channels
                    </h3>
                    <p className="mt-3 text-base text-gray-500">
                      Find and analyze similar channels to understand your
                      competition and discover collaboration opportunities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 bg-orange-50 p-6">
                  <div className="h-12 w-12 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Analytics
                    </h3>
                    <p className="mt-3 text-base text-gray-500">
                      Track your performance and get insights to optimize your
                      content strategy for better engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-all"
            >
              Start Growing Your Channel
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Creators Are Saying
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Join thousands of content creators who are growing their channels
              with Creator Climb.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                    JD
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Jessica Davis
                    </h3>
                    <p className="text-sm text-gray-500">Tech Reviewer</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  &quot;Creator Climb helped me find content ideas that
                  resonated with my audience. My channel has grown by 40% in
                  just three months!&quot;
                </blockquote>
                <div className="mt-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                    MT
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Mark Thompson
                    </h3>
                    <p className="text-sm text-gray-500">Gaming Creator</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  &quot;The similar channels feature helped me find perfect
                  collaboration partners. My subscriber count doubled after our
                  first collab!&quot;
                </blockquote>
                <div className="mt-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                    SJ
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Sarah Johnson
                    </h3>
                    <p className="text-sm text-gray-500">Lifestyle Vlogger</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  &quot;Creator Climb&apos;s analytics helped me understand what
                  content my audience loves. My engagement rate has never been
                  higher!&quot;
                </blockquote>
                <div className="mt-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-500">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to grow your channel?</span>
            <span className="block text-orange-100">
              Start using Creator Climb today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 transition-all"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <Image
                  src="/favicons/android-chrome-192x192.png"
                  alt="Creator Climb Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="ml-3 text-xl font-bold text-white">
                  Creator Climb
                </span>
              </div>
              <p className="text-gray-400 text-base">
                Helping content creators reach new heights with AI-powered
                insights and tools.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">YouTube</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Product
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link
                        href="/dashboard"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/content-ideas"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Content Ideas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Analytics
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Integrations
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Guides
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        API Status
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Press
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Cookie Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {new Date().getFullYear()} Creator Climb. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
