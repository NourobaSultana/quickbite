"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { useAuth } from "@/app/context/AuthContext";

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isActive: boolean;
}

export default function Page() {
  const { logout } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const approveRestaurant = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: true,
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: false,
        }),
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

        if (data.success) {
          setRestaurants(data.restaurants);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    getRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-orange-500">
              QuickBite Administration
            </p>

            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Admin Dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage and approve restaurants registered on QuickBite.
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="flex w-full items-center justify-center rounded-xl border border-red-100 bg-white px-5 py-3 text-sm font-semibold text-red-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Restaurants */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Restaurants
                </p>

                <h3 className="mt-2 text-3xl font-bold text-gray-900">
                  {restaurants.length}
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                🍽️
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>

                <h3 className="mt-2 text-3xl font-bold text-green-600">
                  {
                    restaurants.filter((restaurant) => restaurant.isApproved)
                      .length
                  }
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                ✓
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Approval
                </p>

                <h3 className="mt-2 text-3xl font-bold text-amber-500">
                  {
                    restaurants.filter((restaurant) => !restaurant.isApproved)
                      .length
                  }
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl">
                ⏳
              </div>
            </div>
          </div>
        </div>

        {/* ================= RESTAURANTS SECTION ================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Section Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Restaurants</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Review and manage restaurant applications.
                </p>
              </div>

              <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {restaurants.length} Restaurants
              </span>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="p-5 sm:p-7">
            {/* Loading */}
            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading restaurants...
                </p>
              </div>
            ) : restaurants.length === 0 ? (
              /* Empty State */
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-2xl">
                  🍽️
                </div>

                <h4 className="mt-4 text-lg font-semibold text-gray-900">
                  No restaurants found
                </h4>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  There are currently no restaurants registered on QuickBite.
                </p>
              </div>
            ) : (
              /* ================= RESTAURANT GRID ================= */
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Restaurant Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-orange-50">
                          <span className="text-5xl">🍽️</span>
                        </div>
                      )}

                      {/* Status */}
                      <div className="absolute right-4 top-4">
                        {restaurant.isApproved ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Restaurant Details */}
                    <div className="p-5">
                      {/* Name */}
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-900">
                          {restaurant.name}
                        </h4>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                          {restaurant.description}
                        </p>
                      </div>

                      {/* Information */}
                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        {/* Address */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                            📍
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Address
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-gray-700">
                              {restaurant.address}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                            ☎
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Phone
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-gray-700">
                              {restaurant.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => {
                            if (restaurant.isApproved) {
                              notApproveRestaurant(restaurant._id);
                            } else {
                              approveRestaurant(restaurant._id);
                            }
                          }}
                          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            restaurant.isApproved
                              ? "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                          }`}
                        >
                          {restaurant.isApproved
                            ? "Remove Approval"
                            : "Approve Restaurant"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
