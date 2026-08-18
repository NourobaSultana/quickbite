"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Role = "customer" | "restaurant";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please log in to continue.");

      // Register successful হলে login page-এ যাবে
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Background Decoration */}
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-70" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-orange-50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* ================= LEFT SIDE ================= */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* Logo */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white shadow-lg">
                  🍽️
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Quick<span className="text-orange-500">Bite</span>
                  </h1>

                  <p className="text-sm text-gray-500">Food made easy</p>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-5xl font-bold leading-tight text-gray-900">
                Join
                <br />
                <span className="text-orange-500">QuickBite!</span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Create your QuickBite account and discover a simple, convenient
                way to enjoy your favorite food and restaurants.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    🍔
                  </div>

                  <span className="text-gray-700">
                    Discover your favorite food
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    ✓
                  </div>

                  <span className="text-gray-700">
                    Easy and secure account access
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    ⚡
                  </div>

                  <span className="text-gray-700">
                    Fast and convenient experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= REGISTER FORM ================= */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl text-white shadow-lg">
                  🍽️
                </div>

                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                  Quick<span className="text-orange-500">Bite</span>
                </h1>

                <p className="mt-1 text-sm text-gray-500">Food made easy</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 sm:p-8">
              {/* Form Header */}
              <div className="mb-7 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                  Get Started
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Create Account
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Create your account and start your QuickBite journey.
                </p>
              </div>

              {/* ================= FORM ================= */}
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    I want to join as
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3.5 text-center transition ${
                        role === "customer"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">🍔</span>
                      <span
                        className={`text-sm font-semibold ${
                          role === "customer"
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        Customer
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("restaurant")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3.5 text-center transition ${
                        role === "restaurant"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">🏪</span>
                      <span
                        className={`text-sm font-semibold ${
                          role === "restaurant"
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        Restaurant
                      </span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      minLength={6}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-orange-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Password must be at least 6 characters.
                  </p>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-orange-500 px-4 py-3.5 font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Account..."
                    : `Create ${role === "restaurant" ? "Restaurant" : "Customer"} Account`}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="px-3 text-sm text-gray-400">OR</span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Login */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
