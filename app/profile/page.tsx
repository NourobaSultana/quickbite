"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiShield,
  FiLogOut,
  FiLoader,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";

interface CurrentUser {
  name: string;
  username?: string;
  email?: string;
  role?: "customer" | "restaurant" | "admin";
}

const roleStyles: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
  }
> = {
  customer: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    label: "Customer",
  },
  restaurant: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    label: "Restaurant Owner",
  },
  admin: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    label: "Administrator",
  },
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok && data.success && data.user) {
          setUser(data.user);
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <FiLoader className="animate-spin text-orange-500" size={18} />
          Loading profile...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const role = roleStyles[user.role || "customer"];

  const initial = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-orange-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white transition group-hover:border-orange-200 group-hover:bg-orange-50">
              <FiArrowLeft size={16} />
            </span>
            Back to home
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Account
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Profile Settings
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* LEFT PROFILE CARD */}
          <section className="h-fit overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {/* Small Header */}
            <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-400" />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="-mt-12">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-orange-50 text-3xl font-extrabold text-orange-500 shadow-md">
                  {initial}
                </div>
              </div>

              {/* User Info */}
              <div className="mt-4">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>

                {user.username && (
                  <p className="mt-1 text-sm text-gray-400">@{user.username}</p>
                )}
              </div>

              {/* Role */}
              <div
                className={`mt-5 flex items-center gap-3 rounded-2xl border ${role.border} ${role.bg} px-4 py-3`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${role.text}`}
                >
                  <FiShield size={17} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Account Role
                  </p>

                  <p className={`mt-0.5 text-sm font-bold ${role.text}`}>
                    {role.label}
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500">
                <FiCheckCircle size={15} className="text-green-500" />
                Account is active
              </div>
            </div>
          </section>

          {/* RIGHT DETAILS */}
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            {/* Section Header */}
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <h2 className="text-lg font-bold text-gray-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your account information and profile details.
              </p>
            </div>

            {/* Information */}
            <div className="divide-y divide-gray-100">
              {/* Name */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <FiUser size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Full Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {user.name}
                    </p>
                  </div>
                </div>

                <FiChevronRight size={17} className="text-gray-300" />
              </div>

              {/* Username */}
              {user.username && (
                <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <FiAtSign size={19} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Username
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <FiChevronRight size={17} className="text-gray-300" />
                </div>
              )}

              {/* Email */}
              {user.email && (
                <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <FiMail size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Email Address
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <FiChevronRight
                    size={17}
                    className="shrink-0 text-gray-300"
                  />
                </div>
              )}

              {/* Account Type */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <FiShield size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Account Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {role.label}
                    </p>
                  </div>
                </div>

                <FiChevronRight size={17} className="text-gray-300" />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Sign out of your account
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    You can sign in again anytime.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <FiLogOut size={16} />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Your QuickBite account information is securely managed.
        </p>
      </div>
    </main>
  );
}
