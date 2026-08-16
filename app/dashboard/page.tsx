"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();

  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    router.replace("/login");

    return null;
  }

  if (user.role === "admin") {
    router.replace("/admin");
    return null;
  }

  if (user.role === "restaurant") {
    router.replace("/restaurant");
    return null;
  }

  if (user.role === "customer") {
    router.replace("/customer");
    return null;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

      <p className="mt-2">Email: {user.email}</p>

      <p>Role: {user.role}</p>

      <button
        onClick={async () => {
          await logout();
          router.replace("/login");
        }}
        className="mt-6 rounded bg-red-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </main>
  );
}
