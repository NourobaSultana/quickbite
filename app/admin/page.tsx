"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { useAuth } from "@/app/context/AuthContext";

interface Restaurant {
  _id: string;
  name: string;
  image: string;
  description?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isActive: boolean;
}

// Distinct token set from the customer app on purpose: this is a review
// queue an operator scans quickly, not a menu a customer browses for
// appetite — cooler neutrals, monospace for data, a status rail instead
// of big photography.
const A = {
  bg: "#F6F7F9",
  paper: "#FFFFFF",
  ink: "#14161A",
  inkSoft: "rgba(20,22,26,0.56)",
  line: "#E4E7EC",
  brand: "#FF4E1F",
  brandTint: "#FFF0E9",
  approved: "#0E7A5F",
  approvedTint: "#E9F5F0",
  pending: "#B45309",
  pendingTint: "#FEF6E7",
  danger: "#DC2626",
  dangerTint: "#FEF2F2",
};

type Filter = "all" | "pending" | "approved";

export default function Page() {
  const { logout } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const approveRestaurant = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to approve restaurant");
        return;
      }

      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant._id === restaurantId
            ? { ...restaurant, isApproved: true }
            : restaurant,
        ),
      );

      alert("Restaurant approved successfully!");
    } catch (error) {
      console.error("Approve restaurant error:", error);
    }
  };

  const notApproveRestaurant = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to not approve restaurant");
        return;
      }

      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant._id === restaurantId
            ? { ...restaurant, isApproved: false }
            : restaurant,
        ),
      );
    } catch (error) {
      console.error("Not approve restaurant error:", error);
    }
  };

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await fetch("/api/restaurants");
        const data = await response.json();
        if (data.success) setRestaurants(data.restaurants);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    getRestaurants();
  }, []);

  const approvedCount = restaurants.filter((r) => r.isApproved).length;
  const pendingCount = restaurants.filter((r) => !r.isApproved).length;

  const visibleRestaurants = useMemo(() => {
    let list = restaurants;

    if (filter === "approved") list = list.filter((r) => r.isApproved);
    if (filter === "pending") list = list.filter((r) => !r.isApproved);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [restaurants, filter, search]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: A.bg,
        color: A.ink,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .ad-mono { font-family: 'IBM Plex Mono', monospace; }
        .ad-row { transition: background .15s ease, box-shadow .15s ease; }
        .ad-row:hover { background: #FAFAFB; }
        .ad-focus:focus-visible { outline: 2.5px solid ${A.brand}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .ad-row { transition: none !important; } }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="ad-mono text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: A.brand }}
            >
              QuickBite Admin
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-[34px]">
              Restaurant approvals
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: A.inkSoft }}>
              Review applications and control who's live on QuickBite.
            </p>
          </div>

          {/* <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="ad-focus flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition sm:w-auto"
            style={{
              border: `1px solid #FCA5A5`,
              background: A.paper,
              color: A.danger,
            }}
          >
            Log out
          </button> */}
        </div>

        {/* ================= KPI ROW ================= */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className="rounded-2xl p-5"
            style={{ background: A.paper, border: `1px solid ${A.line}` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: A.inkSoft }}>
                Total restaurants
              </p>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: A.ink }}
              />
            </div>
            <h3 className="ad-mono mt-3 text-3xl font-bold">
              {restaurants.length}
            </h3>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ background: A.paper, border: `1px solid ${A.line}` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: A.inkSoft }}>
                Approved
              </p>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: A.approved }}
              />
            </div>
            <h3
              className="ad-mono mt-3 text-3xl font-bold"
              style={{ color: A.approved }}
            >
              {approvedCount}
            </h3>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ background: A.paper, border: `1px solid ${A.line}` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: A.inkSoft }}>
                Pending review
              </p>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: A.pending }}
              />
            </div>
            <h3
              className="ad-mono mt-3 text-3xl font-bold"
              style={{ color: A.pending }}
            >
              {pendingCount}
            </h3>
          </div>
        </div>

        {/* ================= QUEUE ================= */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: A.paper, border: `1px solid ${A.line}` }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            style={{ borderBottom: `1px solid ${A.line}` }}
          >
            <div
              className="flex gap-1 rounded-xl p-1"
              style={{ background: A.bg }}
            >
              {(
                [
                  ["all", "All", restaurants.length],
                  ["pending", "Pending", pendingCount],
                  ["approved", "Approved", approvedCount],
                ] as [Filter, string, number][]
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="ad-focus ad-mono rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition"
                  style={
                    filter === key
                      ? { background: A.ink, color: "#fff" }
                      : { background: "transparent", color: A.inkSoft }
                  }
                >
                  {label} · {count}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, address, or phone"
              className="ad-focus w-full rounded-xl px-4 py-2.5 text-sm outline-none sm:w-72"
              style={{
                border: `1px solid ${A.line}`,
                background: A.paper,
                color: A.ink,
              }}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center">
              <div
                className="h-9 w-9 animate-spin rounded-full border-4"
                style={{ borderColor: A.line, borderTopColor: A.brand }}
              />
              <p className="mt-4 text-sm" style={{ color: A.inkSoft }}>
                Loading restaurants...
              </p>
            </div>
          ) : visibleRestaurants.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ background: A.brandTint }}
              >
                🍽️
              </div>
              <h4 className="mt-4 text-base font-semibold">
                {search ? "No matches" : "No restaurants found"}
              </h4>
              <p className="mt-1 max-w-md text-sm" style={{ color: A.inkSoft }}>
                {search
                  ? "Try a different name, address, or phone number."
                  : "There are currently no restaurants registered on QuickBite."}
              </p>
            </div>
          ) : (
            <ul>
              {visibleRestaurants.map((restaurant) => (
                <li
                  key={restaurant._id}
                  className="ad-row relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
                  style={{ borderBottom: `1px solid ${A.line}` }}
                >
                  {/* Status rail */}
                  <span
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: restaurant.isApproved
                        ? A.approved
                        : A.pending,
                    }}
                    aria-hidden="true"
                  />

                  {/* Thumbnail */}
                  <div
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                    style={{ background: A.brandTint }}
                  >
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold">{restaurant.name}</h4>
                      <span
                        className="ad-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                        style={
                          restaurant.isApproved
                            ? { background: A.approvedTint, color: A.approved }
                            : { background: A.pendingTint, color: A.pending }
                        }
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: restaurant.isApproved
                              ? A.approved
                              : A.pending,
                          }}
                        />
                        {restaurant.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    {restaurant.description && (
                      <p
                        className="mt-1 line-clamp-1 text-sm"
                        style={{ color: A.inkSoft }}
                      >
                        {restaurant.description}
                      </p>
                    )}

                    <div
                      className="ad-mono mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"
                      style={{ color: A.inkSoft }}
                    >
                      {restaurant.address && (
                        <span>📍 {restaurant.address}</span>
                      )}
                      {restaurant.phone && <span>☎ {restaurant.phone}</span>}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="w-full shrink-0 sm:w-auto">
                    <button
                      onClick={() =>
                        restaurant.isApproved
                          ? notApproveRestaurant(restaurant._id)
                          : approveRestaurant(restaurant._id)
                      }
                      className="ad-focus w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:w-auto"
                      style={
                        restaurant.isApproved
                          ? {
                              border: `1px solid #FCA5A5`,
                              background: A.dangerTint,
                              color: A.danger,
                            }
                          : { background: A.brand, color: "#fff" }
                      }
                    >
                      {restaurant.isApproved ? "Remove approval" : "Approve"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
