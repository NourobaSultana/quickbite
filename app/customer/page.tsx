"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Star,
  Utensils,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";

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

export default function CustomerPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // ================= FETCH APPROVED RESTAURANTS =================

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/restaurants");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch restaurants");
        }

        if (data.success) {
          setRestaurants(data.restaurants || []);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    getRestaurants();
  }, []);

  // ================= ONLY APPROVED + ACTIVE =================

  const approvedRestaurants = useMemo(() => {
    return restaurants.filter(
      (restaurant) =>
        restaurant.isApproved === true && restaurant.isActive === true,
    );
  }, [restaurants]);

  // ================= SEARCH =================

  const filteredRestaurants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return approvedRestaurants;
    }

    return approvedRestaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(keyword) ||
        restaurant.description?.toLowerCase().includes(keyword) ||
        restaurant.address?.toLowerCase().includes(keyword)
      );
    });
  }, [approvedRestaurants, search]);

  // ================= LOGOUT =================

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-900">
      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600">
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-white" />
              Discover delicious food near you
            </span>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Good food.
              <br />
              Good mood.
              <br />
              <span className="text-orange-100">Delivered by QuickBite.</span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-orange-50 sm:text-base">
              Explore restaurants approved by QuickBite and discover your next
              favorite meal.
            </p>

            {/* Search */}
            <div className="mt-8 flex max-w-2xl items-center rounded-2xl bg-white p-2 shadow-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Search size={20} />
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants, food or location..."
                className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />

              <button className="hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 sm:block">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* QUICK STATS */}
      {/* ========================================================= */}

      <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Utensils size={21} />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">
                {approvedRestaurants.length}
              </p>

              <p className="text-xs font-medium text-gray-500">
                Approved Restaurants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Clock size={21} />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">24/7</p>

              <p className="text-xs font-medium text-gray-500">
                Easy Food Discovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-500">
              <Star size={21} />
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>

              <p className="text-xs font-medium text-gray-500">
                Customer Experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* RESTAURANTS */}
      {/* ========================================================= */}

      <section
        id="restaurants"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
              Explore
            </p>

            <h3 className="mt-2 text-3xl font-extrabold text-gray-900">
              Restaurants for you
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Browse restaurants that have been approved and are currently
              available on QuickBite.
            </p>
          </div>

          <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
            {filteredRestaurants.length} available
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-52 animate-pulse bg-gray-200" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />

                  <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          /* Empty */
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
              🍽️
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              {search ? "No restaurants found" : "No restaurants available yet"}
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {search
                ? "Try searching with another restaurant name, food or location."
                : "Once an admin approves a restaurant, it will appear here for customers."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Restaurant Grid */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-orange-50">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                      <span className="text-6xl">🍴</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Open Badge */}
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-600 shadow-md">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Open
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800 shadow-md">
                    <Star
                      size={13}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    4.8
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900 transition group-hover:text-orange-500">
                      {restaurant.name}
                    </h4>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {restaurant.description ||
                        "Delicious food and great service waiting for you."}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    {restaurant.address && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <MapPin size={15} />
                        </div>

                        <p className="pt-1 text-xs font-medium leading-5 text-gray-600">
                          {restaurant.address}
                        </p>
                      </div>
                    )}

                    {restaurant.phone && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                          <Phone size={15} />
                        </div>

                        <p className="text-xs font-medium text-gray-600">
                          {restaurant.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() =>
                      router.push(`/customer/restaurants/${restaurant._id}`)
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
                  >
                    Explore Restaurant
                    <ChevronRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              Quick<span className="text-orange-500">Bite</span>
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Your favorite food, just a bite away.
            </p>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} QuickBite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
