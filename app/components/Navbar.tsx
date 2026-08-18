"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  useRouter,
  usePathname,
  useParams,
  useSearchParams,
} from "next/navigation";
import {
  FiUser,
  FiLogOut,
  FiLogIn,
  FiMenu,
  FiX,
  FiChevronDown,
  FiHome,
  FiGrid,
  FiTag,
  FiShoppingBag,
} from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import { IoRestaurantOutline } from "react-icons/io5";

interface CurrentUser {
  name: string;
  username?: string;
  email?: string;
  role?: "customer" | "restaurant" | "admin";
}

export default function Navbar() {
  const params = useParams();
  const searchParams = useSearchParams();
  // user customer
  const restaurantId = params?.restaurantId as string | undefined;
  // user restaurant
  const restaurantsId =
    (params?.restaurantId as string | undefined) ||
    searchParams?.get("restaurantId") ||
    undefined;
  const categoryId = searchParams?.get("categoryId") || undefined;
  const router = useRouter();
  const pathname = usePathname();
  // For customer user
  const isOnRestaurantPage =
    pathname?.startsWith("/customer/restaurants/") && !!restaurantId;

  //For Restaurant user
  const isOnOwnRestaurantFlow =
    (pathname === "/category" || pathname === "/foods") && !!restaurantsId;
  const isOnFoodsPage =
    pathname === "/foods" && !!restaurantsId && !!categoryId;

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const justLoggedOut = useRef(false);

  useEffect(() => {
    // If we just logged out locally, skip this one refetch — otherwise
    // it can race against the logout request and briefly show the old
    // user again before the cookie is fully cleared on the server.
    if (justLoggedOut.current) {
      justLoggedOut.current = false;
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear local state immediately and instruct the very next
      // pathname-triggered effect to skip re-fetching, so the navbar
      // shows "Home only" the instant the button is clicked — no
      // reload, and no race with the redirect that follows.
      justLoggedOut.current = true;
      setUser(null);
      setProfileOpen(false);
      router.push("/login");
    }
  };

  // Everyone sees Home. Restaurant owners additionally see the
  // create-restaurant / create-category / create-food links.
  const getNavLinks = () => {
    switch (user?.role) {
      case "restaurant": {
        const links = [
          // { label: "Home", href: "/", icon: FiHome },
          // { label: "Create Restaurant", href: "/restaurant", icon: FiHome },
          // { label: "Create Food Type", href: "/category", icon: FiTag },
          // { label: "Create Food", href: "/foods", icon: FiShoppingBag },
        ];

        // Dynamically append a link scoped to the restaurant they just created
        if (isOnOwnRestaurantFlow) {
          links.push({
            label: "My Restaurant",
            href: `/category?restaurantId=${restaurantsId}`,
            icon: IoRestaurantOutline,
          });
        }

        // Dynamically appears only when on /foods with both ids present
        if (isOnFoodsPage) {
          links.push({
            label: "Food Category",
            href: `/foods?restaurantId=${restaurantsId}&categoryId=${categoryId}`,
            icon: FiTag,
          });
        }

        return links;
      }

      case "admin":
        return [{ label: "Home", href: "/", icon: FiHome }];

      case "customer": {
        const links = [
          // { label: "Home", href: "/", icon: FiHome },
          { label: "Restaurant", href: "/customer", icon: FaUtensils },
        ];

        if (isOnRestaurantPage) {
          links.push({
            label: "Food Menu",
            href: `/customer/restaurants/${restaurantId}`,
            icon: IoRestaurantOutline,
          });
        }

        return links;
      }

      default:
        return [{ label: "Home", href: "/", icon: FiHome }];
    }
  };
  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={user ? "/profile" : "/"}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">
              QB
            </div>
            <span className="text-lg font-bold text-gray-900">
              Quick<span className="text-orange-500">Bite</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: auth area (desktop) */}
          <div className="hidden md:block">
            {loadingUser ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 py-1.5 pl-1.5 pr-3 transition hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <FiUser size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight text-gray-900">
                      {user.name}
                    </p>
                    {user.username && (
                      <p className="text-xs leading-tight text-gray-400">
                        @{user.username}
                      </p>
                    )}
                  </div>
                  <FiChevronDown
                    size={15}
                    className={`text-gray-400 transition ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-gray-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <FiLogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <FiLogIn size={16} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-50 md:hidden"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-gray-100 pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              {loadingUser ? (
                <div className="mx-4 h-9 animate-pulse rounded-lg bg-gray-100" />
              ) : user ? (
                <div className="px-4">
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                      <FiUser size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      {user.username && (
                        <p className="text-xs text-gray-400">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    <FiLogIn size={16} />
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
