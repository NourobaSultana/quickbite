"use client";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl shadow-sm">
              🍽️
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Quick<span className="text-orange-500">Bite</span>
              </h1>

              <p className="hidden text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:block">
                Food made easy
              </p>
            </div>
          </div>

          {/* Navbar buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                router.push("/login");
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 sm:px-5"
            >
              Login
            </button>

            <button
              onClick={() => {
                router.push("/register");
              }}
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 sm:px-5"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <main className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          {/* ================= LEFT CONTENT ================= */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-orange-500" />

              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 sm:text-sm">
                Welcome to QuickBite
              </span>
            </div>

            {/* Heading */}
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:mx-0">
              Good food.
              <br />
              <span className="text-orange-500">Great moments.</span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8 lg:mx-0">
              Discover delicious food from your favorite restaurants, order
              easily, and enjoy a better food experience with QuickBite.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={() => {
                  router.push("/login");
                }}
                className="rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Get Started
              </button>

              <button
                onClick={() => {
                  router.push("/register");
                }}
                className="rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
              >
                Create Account
              </button>
            </div>

            {/* Small features */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-500 lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-xs text-green-600">
                  ✓
                </span>
                Easy Ordering
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-xs text-green-600">
                  ✓
                </span>
                Trusted Restaurants
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-xs text-green-600">
                  ✓
                </span>
                Simple & Fast
              </div>
            </div>
          </div>

          {/* ================= RIGHT VISUAL ================= */}
          <div className="relative mx-auto w-full max-w-lg">
            {/* Main card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/50 sm:p-7">
              {/* Top */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Today's Special
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-gray-900">
                    Delicious Choices
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                  ❤️
                </div>
              </div>

              {/* Food visual */}
              <div className="relative mt-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 sm:h-72">
                <div className="absolute h-52 w-52 rounded-full bg-orange-100 sm:h-60 sm:w-60" />

                <div className="relative z-10 text-8xl drop-shadow-xl sm:text-9xl">
                  🍔
                </div>
              </div>

              {/* Food details */}
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">Tasty Burger</h4>

                  <p className="mt-1 text-sm text-gray-500">
                    Fresh & delicious
                  </p>
                </div>

                <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-600">
                  ★ 4.9
                </span>
              </div>

              {/* Fake order bar */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">Ready to order?</p>

                  <p className="text-sm font-semibold text-gray-800">
                    Your favorite food awaits
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white">
                  →
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -left-3 top-10 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  ✓
                </div>

                <div>
                  <p className="text-xs text-gray-400">Quick & Easy</p>

                  <p className="text-sm font-bold text-gray-800">
                    Order anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -right-3 bottom-10 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg sm:-right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  🍴
                </div>

                <div>
                  <p className="text-xs text-gray-400">Restaurants</p>

                  <p className="text-sm font-bold text-gray-800">
                    Delicious food
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
