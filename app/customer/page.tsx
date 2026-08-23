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

// ================= VISUAL THEME (no DB fields needed) =================
// Restaurants don't have cuisine/color fields in the schema, so we derive
// a stable illustrated fallback (gradient + emoji) from the restaurant's
// own id. Same restaurant always gets the same look; real `image` is
// always preferred when present.

const THEMES = [
  { emoji: "🍛", gradient: "linear-gradient(135deg,#FF9A5A,#C2340A)" },
  { emoji: "🍜", gradient: "linear-gradient(135deg,#FFC24B,#C2340A)" },
  { emoji: "🍔", gradient: "linear-gradient(135deg,#FF7A45,#8A2110)" },
  { emoji: "🍣", gradient: "linear-gradient(135deg,#FF8F6B,#B32A18)" },
  { emoji: "🍚", gradient: "linear-gradient(135deg,#FFB74B,#B3280F)" },
  { emoji: "🍰", gradient: "linear-gradient(135deg,#FFA66B,#9C2A17)" },
];

function themeFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THEMES[hash % THEMES.length];
}

const T = {
  bg: "#FCFAF8",
  paper: "#FFFFFF",
  ink: "#17130F",
  inkSoft: "rgba(23,19,15,0.58)",
  line: "#EAE1D6",
  brand: "#FF4E1F",
  brandDark: "#C2340A",
  brandTint: "#FFF0E9",
  mint: "#0E7A5F",
  mintTint: "#E9F5F0",
  gold: "#E7A100",
};

function Perforation() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 16,
        marginTop: -8,
        backgroundImage: `radial-gradient(circle, ${T.paper} 0 4.5px, transparent 5px)`,
        backgroundSize: "16px 16px",
        backgroundPosition: "center",
        position: "relative",
        zIndex: 1,
      }}
    />
  );
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
    <div className="min-h-screen" style={{ background: T.bg, color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .qb-display { font-family: 'Bricolage Grotesque', sans-serif; }
        .qb-mono { font-family: 'IBM Plex Mono', monospace; }
        .qb-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); box-shadow: 0 1px 2px rgba(23,19,15,0.04); }
        .qb-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -20px rgba(23,19,15,0.22); }
        .qb-emoji { transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .qb-card:hover .qb-emoji { transform: scale(1.12) rotate(-4deg); }
        .qb-img { transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .qb-card:hover .qb-img { transform: scale(1.06); }
        .qb-arrow { transition: transform .3s; }
        .qb-card:hover .qb-arrow { transform: translateX(3px); }
        .qb-focus:focus-visible { outline: 2.5px solid ${T.brand}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .qb-card, .qb-emoji, .qb-img, .qb-arrow { transition: none !important; }
          .qb-card:hover { transform: none !important; }
        }
      `}</style>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
        }}
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="qb-mono inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-white" />
              Now serving your area
            </span>

            <h2 className="qb-display mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
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
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: T.brandTint, color: T.brand }}
              >
                <Search size={20} />
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants, food or location..."
                className="qb-focus h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />

              <button
                className="hidden rounded-xl px-6 py-3 text-sm font-semibold text-white transition sm:block"
                style={{ background: T.brand }}
              >
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
          <div
            className="flex items-center gap-4 rounded-2xl p-5 shadow-md"
            style={{ background: T.paper, border: `1px solid ${T.line}` }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: T.brandTint, color: T.brand }}
            >
              <Utensils size={21} />
            </div>
            <div>
              <p className="qb-mono text-2xl font-bold">
                {approvedRestaurants.length}
              </p>
              <p className="text-xs font-medium" style={{ color: T.inkSoft }}>
                Approved Restaurants
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-4 rounded-2xl p-5 shadow-md"
            style={{ background: T.paper, border: `1px solid ${T.line}` }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: T.mintTint, color: T.mint }}
            >
              <Clock size={21} />
            </div>
            <div>
              <p className="qb-mono text-2xl font-bold">24/7</p>
              <p className="text-xs font-medium" style={{ color: T.inkSoft }}>
                Easy Food Discovery
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-4 rounded-2xl p-5 shadow-md"
            style={{ background: T.paper, border: `1px solid ${T.line}` }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "#FFF7E0", color: T.gold }}
            >
              <Star size={21} />
            </div>
            <div>
              <p className="qb-mono text-2xl font-bold">4.8</p>
              <p className="text-xs font-medium" style={{ color: T.inkSoft }}>
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="qb-mono text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: T.brandDark }}
            >
              Explore
            </p>
            <h3 className="qb-display mt-2 text-3xl font-extrabold sm:text-4xl">
              What are you craving?
            </h3>
            <p
              className="mt-2 max-w-xl text-sm leading-6"
              style={{ color: T.inkSoft }}
            >
              Browse restaurants that have been approved and are currently
              available on QuickBite.
            </p>
          </div>

          <div
            className="qb-mono inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            style={{ background: T.brandTint, color: T.brandDark }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: T.mint }}
            />
            {filteredRestaurants.length} available
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl"
                style={{ border: `1px solid ${T.line}`, background: T.paper }}
              >
                <div
                  className="h-40 animate-pulse"
                  style={{ background: T.line }}
                />
                <div className="space-y-3 p-5">
                  <div
                    className="h-3 w-1/3 animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-5 w-2/3 animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-10 w-full animate-pulse rounded-xl"
                    style={{ background: T.line }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          /* Empty */
          <div
            className="rounded-3xl px-6 py-16 text-center"
            style={{ border: `1.5px dashed ${T.line}`, background: T.paper }}
          >
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ background: T.brandTint }}
            >
              🍽️
            </div>
            <h4 className="qb-display mt-5 text-xl font-bold">
              {search
                ? "Nothing matches that search"
                : "No restaurants available yet"}
            </h4>
            <p
              className="mx-auto mt-2 max-w-md text-sm leading-6"
              style={{ color: T.inkSoft }}
            >
              {search
                ? "Try a different name, cuisine, or area."
                : "Once an admin approves a restaurant, it will appear here for customers."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="qb-focus mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white transition"
                style={{ background: T.brand }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Restaurant Grid — ticket/docket cards */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => {
              const theme = themeFor(restaurant._id);

              return (
                <article
                  key={restaurant._id}
                  className="qb-card group relative flex flex-col overflow-hidden rounded-3xl"
                  style={{ background: T.paper, border: `1px solid ${T.line}` }}
                >
                  {/* Header tile: real image if present, else illustrated fallback */}
                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden"
                    style={{ background: theme.gradient }}
                  >
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="qb-img h-full w-full object-cover"
                      />
                    ) : (
                      <span className="qb-emoji select-none text-6xl">
                        {theme.emoji}
                      </span>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className="qb-mono inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ background: T.mintTint, color: T.mint }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: T.mint }}
                        />
                        Open now
                      </span>
                    </div>

                    <div
                      className="qb-mono absolute right-4 top-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        color: T.ink,
                      }}
                    >
                      <Star size={12} style={{ fill: T.gold, color: T.gold }} />
                      4.8
                    </div>
                  </div>

                  <Perforation />

                  {/* Body */}
                  <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
                    <h4 className="qb-display text-xl font-bold">
                      {restaurant.name}
                    </h4>

                    <p
                      className="mt-2 line-clamp-2 text-sm leading-6"
                      style={{ color: T.inkSoft }}
                    >
                      {restaurant.description ||
                        "Delicious food and great service waiting for you."}
                    </p>

                    <div
                      className="qb-mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs"
                      style={{ color: T.inkSoft }}
                    >
                      {restaurant.address && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} style={{ color: T.brand }} />
                          {restaurant.address}
                        </span>
                      )}
                      {restaurant.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={13} style={{ color: T.brand }} />
                          {restaurant.phone}
                        </span>
                      )}
                    </div>

                    {/* Tear-off stub CTA */}
                    <button
                      onClick={() =>
                        router.push(`/customer/restaurants/${restaurant._id}`)
                      }
                      className="qb-focus mt-5 flex items-center justify-between rounded-xl border-0 bg-transparent pt-4 text-sm font-semibold"
                      style={{ borderTop: `1.5px dashed ${T.line}` }}
                    >
                      View menu
                      <span
                        className="qb-arrow flex h-8 w-8 items-center justify-center rounded-full text-white"
                        style={{ background: T.brand }}
                      >
                        <ChevronRight size={16} />
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer style={{ borderTop: `1px solid ${T.line}`, background: T.paper }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="qb-display text-lg font-extrabold">
              Quick<span style={{ color: T.brand }}>Bite</span>
            </h2>
            <p className="mt-1 text-xs" style={{ color: T.inkSoft }}>
              Your favorite food, just a bite away.
            </p>
          </div>
          <p className="qb-mono text-xs" style={{ color: T.inkSoft }}>
            © {new Date().getFullYear()} QuickBite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
