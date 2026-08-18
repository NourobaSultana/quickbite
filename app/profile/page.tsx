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
} from "react-icons/fi";

interface CurrentUser {
  name: string;
  username?: string;
  email?: string;
  role?: "customer" | "restaurant" | "admin";
}

const roleStyles: Record<string, { bg: string; text: string; label: string }> =
  {
    customer: { bg: "bg-blue-50", text: "text-blue-600", label: "Customer" },
    restaurant: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      label: "Restaurant Owner",
    },
    admin: {
      bg: "bg-purple-50",
      text: "text-purple-600",
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

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <FiLoader className="animate-spin text-orange-500" size={18} />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) return null; // redirect already in-flight

  const role = roleStyles[user.role || "customer"];

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-orange-500"
        >
          <FiArrowLeft size={16} />
          Back to home
        </button>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Header banner */}
          <div className="relative h-28 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />
          </div>

          {/* Avatar + name */}
          <div className="relative px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex items-end justify-between">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-orange-100 text-4xl font-extrabold text-orange-500 shadow-md">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>

              {role && (
                <span
                  className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${role.bg} ${role.text}`}
                >
                  <FiShield size={13} />
                  {role.label}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
              {user.name}
            </h1>

            {user.username && (
              <p className="mt-1 text-sm text-gray-400">@{user.username}</p>
            )}

            {/* Details */}
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <FiUser size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                </div>
              </div>

              {user.username && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <FiAtSign size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Username
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      @{user.username}
                    </p>
                  </div>
                </div>
              )}

              {user.email && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <FiMail size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <FiShield size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Account Type
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {role?.label || "User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </main>
  );
}
