"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  MapPin,
  Phone,
  Star,
  Clock,
  UtensilsCrossed,
  ChevronRight,
  Loader2,
  Trash2,
  User,
  Navigation,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Restaurant {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  restaurantId: string;
  isActive: boolean;
}

interface Food {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  restaurantId: string;
  categoryId: string;
}

interface CartItem {
  foodId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  categoryId: string;
}

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
}

// ============================================================
// PAGE
// ============================================================

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const restaurantId = params.restaurantId as string;

  // ============================================================
  // STATE
  // ============================================================

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [foods, setFoods] = useState<Food[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [search, setSearch] = useState("");

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  const [loadingMenu, setLoadingMenu] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    address: "",
  });

  const [placingOrder, setPlacingOrder] = useState(false);

  const [checkoutError, setCheckoutError] = useState("");

  const [locatingUser, setLocatingUser] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ============================================================
  // LOAD CART FROM LOCAL STORAGE
  // ============================================================

  useEffect(() => {
    if (!restaurantId) return;

    const savedCart = localStorage.getItem(`quickbite-cart-${restaurantId}`);

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
  }, [restaurantId]);

  // ============================================================
  // SAVE CART
  // ============================================================

  useEffect(() => {
    if (!restaurantId) return;

    localStorage.setItem(
      `quickbite-cart-${restaurantId}`,
      JSON.stringify(cart),
    );
  }, [cart, restaurantId]);

  // ============================================================
  // FETCH RESTAURANT
  // ============================================================

  useEffect(() => {
    if (!restaurantId) return;

    const getRestaurant = async () => {
      try {
        setLoadingRestaurant(true);

        const response = await fetch(`/api/restaurants/${restaurantId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load restaurant");
        }

        if (data.success) {
          setRestaurant(data.restaurant || data.data);
        }
      } catch (error) {
        console.error("Restaurant fetch error:", error);
      } finally {
        setLoadingRestaurant(false);
      }
    };

    getRestaurant();
  }, [restaurantId]);

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

  useEffect(() => {
    if (!restaurantId) return;

    const getCategories = async () => {
      try {
        const response = await fetch(
          `/api/categories?restaurantId=${restaurantId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };

    getCategories();
  }, [restaurantId]);

  // ============================================================
  // FETCH FOODS
  // ============================================================

  useEffect(() => {
    if (!restaurantId || categories.length === 0) {
      setLoadingMenu(false);
      return;
    }

    const getFoods = async () => {
      try {
        setLoadingMenu(true);

        const foodRequests = categories.map(async (category) => {
          const response = await fetch(
            `/api/foods?restaurantId=${restaurantId}&categoryId=${category._id}`,
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to load foods");
          }

          return data.success ? data.foods || [] : [];
        });

        const results = await Promise.all(foodRequests);

        const allFoods = results.flat();

        setFoods(allFoods);
      } catch (error) {
        console.error("Food fetch error:", error);
      } finally {
        setLoadingMenu(false);
      }
    };

    getFoods();
  }, [restaurantId, categories]);

  // ============================================================
  // FILTER FOODS
  // ============================================================

  const filteredFoods = useMemo(() => {
    let result = foods;

    if (selectedCategory !== "all") {
      result = result.filter((food) => food.categoryId === selectedCategory);
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(keyword) ||
          food.description?.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [foods, selectedCategory, search]);

  // ============================================================
  // CART TOTAL
  // ============================================================

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // ============================================================
  // ADD TO CART
  // ============================================================

  const addToCart = (food: Food) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.foodId === food._id,
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.foodId === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...previousCart,
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          quantity: 1,
          categoryId: food.categoryId,
        },
      ];
    });
  };

  const increaseQuantity = (foodId: string) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.foodId === foodId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (foodId: string) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.foodId === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (foodId: string) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.foodId !== foodId),
    );
  };

  // ============================================================
  // CHECKOUT MODAL
  // ============================================================

  const openCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError("");
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  // Capture the customer's current GPS position so the rider
  // has an actual destination to navigate to and the ETA can
  // be calculated on the tracking page.
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setCheckoutError("Geolocation is not supported on this device.");
      return;
    }

    setLocatingUser(true);
    setCheckoutError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocatingUser(false);
      },
      () => {
        setCheckoutError(
          "Couldn't get your location. You can still place the order using your written address.",
        );
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const placeOrder = async () => {
    if (!user?._id) {
      setCheckoutError("User information is missing. Please login again.");
      return;
    }

    if (
      !checkoutForm.name.trim() ||
      !checkoutForm.phone.trim() ||
      !checkoutForm.address.trim()
    ) {
      setCheckoutError("Please fill in your name, phone, and address.");
      return;
    }

    if (!restaurantId) {
      setCheckoutError("Restaurant information is missing.");
      return;
    }

    setPlacingOrder(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customerId: user._id,
          restaurantId,

          items: cart.map((item) => ({
            foodId: item.foodId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),

          totalAmount: cartTotal,

          customerName: checkoutForm.name.trim(),
          customerPhone: checkoutForm.phone.trim(),
          deliveryAddress: checkoutForm.address.trim(),

          deliveryLocation,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setCheckoutError(data.message || "Failed to place order");
        return;
      }

      setCart([]);
      localStorage.removeItem(`quickbite-cart-${restaurantId}`);

      router.push(`/customer/track/${data.order._id}`);
    } catch (error) {
      console.error("Place order error:", error);
      setCheckoutError("Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

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
  // ============================================================
  // LOADING RESTAURANT
  // ============================================================

  if (loadingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg">
            🍔
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
            <Loader2 size={17} className="animate-spin text-orange-500" />
            Loading restaurant...
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESTAURANT NOT FOUND
  // ============================================================

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
            🍽️
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Restaurant not found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This restaurant may have been removed or is currently unavailable.
          </p>

          <button
            onClick={() => router.push("/customer")}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.ink }}>
      <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .qb-display { font-family: 'Bricolage Grotesque', sans-serif; }
    .qb-mono { font-family: 'IBM Plex Mono', monospace; }
    .qb-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1); box-shadow: 0 1px 2px rgba(23,19,15,0.04); }
    .qb-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -20px rgba(23,19,15,0.22); }
    .qb-img { transition: transform .5s cubic-bezier(.22,1,.36,1); }
    .qb-card:hover .qb-img { transform: scale(1.06); }
    .qb-focus:focus-visible { outline: 2.5px solid ${T.brand}; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      .qb-card, .qb-img { transition: none !important; }
      .qb-card:hover { transform: none !important; }
    }
  `}</style>

      {/* ====================================================== */}
      {/* RESTAURANT HERO */}
      {/* ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/customer")}
          className="qb-focus mb-5 flex items-center gap-2 text-sm font-semibold transition"
          style={{ color: T.inkSoft }}
        >
          <ArrowLeft size={17} />
          Back to restaurants
        </button>

        <div
          className="overflow-hidden rounded-3xl"
          style={{ background: T.paper, border: `1px solid ${T.line}` }}
        >
          <div className="relative h-64 overflow-hidden sm:h-80 lg:h-[360px]">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                }}
              >
                <span className="text-7xl">🍽️</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute left-5 top-5">
              <span
                className="qb-mono inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg"
                style={{ background: T.mintTint, color: T.mint }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: T.mint }}
                />
                Open Now
              </span>
            </div>

            <div className="absolute bottom-6 left-5 right-5 text-white sm:left-8 sm:bottom-8">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="qb-mono flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.95)", color: T.ink }}
                >
                  <Star size={13} style={{ fill: T.gold, color: T.gold }} />
                  4.8
                </span>

                <span className="qb-mono rounded-lg bg-black/30 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide backdrop-blur">
                  Restaurant
                </span>
              </div>

              <h2 className="qb-display text-3xl font-extrabold sm:text-4xl">
                {restaurant.name}
              </h2>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-7">
            <div className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: T.brandTint, color: T.brand }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <p
                  className="qb-mono text-xs font-semibold uppercase tracking-wide"
                  style={{ color: T.inkSoft }}
                >
                  Location
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: T.ink }}
                >
                  {restaurant.address || "Location unavailable"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: T.brandTint, color: T.brand }}
              >
                <Phone size={18} />
              </div>
              <div>
                <p
                  className="qb-mono text-xs font-semibold uppercase tracking-wide"
                  style={{ color: T.inkSoft }}
                >
                  Contact
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: T.ink }}
                >
                  {restaurant.phone || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: T.mintTint, color: T.mint }}
              >
                <Clock size={18} />
              </div>
              <div>
                <p
                  className="qb-mono text-xs font-semibold uppercase tracking-wide"
                  style={{ color: T.inkSoft }}
                >
                  Availability
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: T.mint }}
                >
                  Currently available
                </p>
              </div>
            </div>
          </div>

          {restaurant.description && (
            <div
              className="px-5 py-5 sm:px-7"
              style={{ borderTop: `1px solid ${T.line}` }}
            >
              <p className="text-sm leading-7" style={{ color: T.inkSoft }}>
                {restaurant.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================== */}
      {/* MENU SECTION */}
      {/* ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="qb-mono text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: T.brandDark }}
            >
              Our Menu
            </p>
            <h3
              className="qb-display mt-2 text-3xl font-extrabold sm:text-4xl"
              style={{ color: T.ink }}
            >
              Choose something delicious
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: T.inkSoft }}>
              Explore the menu and add your favorite items to your cart.
            </p>
          </div>

          <div
            className="flex w-full max-w-md items-center rounded-xl px-3 shadow-sm"
            style={{ border: `1px solid ${T.line}`, background: T.paper }}
          >
            <Search
              size={19}
              className="shrink-0"
              style={{ color: T.inkSoft }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food..."
              className="qb-focus h-12 w-full bg-transparent px-3 text-sm outline-none"
              style={{ color: T.ink }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ color: T.inkSoft }}
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className="qb-mono qb-focus rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide transition"
                style={
                  selectedCategory === "all"
                    ? { background: T.brand, color: "#fff" }
                    : {
                        border: `1px solid ${T.line}`,
                        background: T.paper,
                        color: T.inkSoft,
                      }
                }
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className="qb-mono qb-focus rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide transition"
                  style={
                    selectedCategory === category._id
                      ? { background: T.brand, color: "#fff" }
                      : {
                          border: `1px solid ${T.line}`,
                          background: T.paper,
                          color: T.inkSoft,
                        }
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingMenu ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl"
                style={{ border: `1px solid ${T.line}`, background: T.paper }}
              >
                <div
                  className="h-52 animate-pulse"
                  style={{ background: T.line }}
                />
                <div className="space-y-4 p-5">
                  <div
                    className="h-5 w-2/3 animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-4 w-4/5 animate-pulse rounded"
                    style={{ background: T.line }}
                  />
                  <div
                    className="h-11 animate-pulse rounded-xl"
                    style={{ background: T.line }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div
            className="mt-8 rounded-3xl px-6 py-16 text-center"
            style={{ border: `1.5px dashed ${T.line}`, background: T.paper }}
          >
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl"
              style={{ background: T.brandTint }}
            >
              🍴
            </div>
            <h4
              className="qb-display mt-5 text-xl font-bold"
              style={{ color: T.ink }}
            >
              No food items found
            </h4>
            <p
              className="mx-auto mt-2 max-w-md text-sm leading-6"
              style={{ color: T.inkSoft }}
            >
              {search
                ? "Try searching for another food item."
                : "This restaurant hasn't added food items to this category yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="qb-focus mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: T.brand }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((food) => {
              const cartItem = cart.find((item) => item.foodId === food._id);

              return (
                <article
                  key={food._id}
                  className="qb-card group flex flex-col overflow-hidden rounded-3xl"
                  style={{ background: T.paper, border: `1px solid ${T.line}` }}
                >
                  <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: T.brandTint }}
                  >
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="qb-img h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${T.brand}, ${T.brandDark})`,
                        }}
                      >
                        <UtensilsCrossed size={50} className="text-white/70" />
                      </div>
                    )}
                  </div>

                  {/* Perforated seam */}
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

                  <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        className="qb-display text-lg font-bold"
                        style={{ color: T.ink }}
                      >
                        {food.name}
                      </h4>
                      <span
                        className="qb-mono shrink-0 rounded-lg px-2.5 py-1 text-sm font-extrabold"
                        style={{ background: T.brandTint, color: T.brandDark }}
                      >
                        ৳{food.price}
                      </span>
                    </div>

                    <p
                      className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-6"
                      style={{ color: T.inkSoft }}
                    >
                      {food.description || "A delicious choice from our menu."}
                    </p>

                    <div
                      className="qb-mono mt-3 flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: T.inkSoft }}
                    >
                      <Star size={13} style={{ fill: T.gold, color: T.gold }} />
                      <span>4.8</span>
                      <span style={{ color: T.line }}>•</span>
                      <span>Popular choice</span>
                    </div>

                    <div className="mt-5">
                      {!cartItem ? (
                        <button
                          onClick={() => addToCart(food)}
                          className="qb-focus flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-sm transition"
                          style={{ background: T.brand }}
                        >
                          <Plus size={18} />
                          Add to Cart
                        </button>
                      ) : (
                        <div
                          className="flex items-center justify-between rounded-xl p-2"
                          style={{ background: T.brandTint }}
                        >
                          <button
                            onClick={() => decreaseQuantity(food._id)}
                            className="qb-focus flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition"
                            style={{ background: T.paper, color: T.brand }}
                          >
                            <Minus size={17} />
                          </button>

                          <div className="text-center">
                            <p
                              className="qb-mono text-[10px] font-semibold uppercase tracking-wide"
                              style={{ color: T.inkSoft }}
                            >
                              Qty
                            </p>
                            <p
                              className="qb-mono text-lg font-extrabold"
                              style={{ color: T.ink }}
                            >
                              {cartItem.quantity}
                            </p>
                          </div>

                          <button
                            onClick={() => increaseQuantity(food._id)}
                            className="qb-focus flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm transition"
                            style={{ background: T.brand }}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ====================================================== */}
      {/* FLOATING CART BUTTON */}
      {/* ====================================================== */}

      {cartCount > 0 && !cartOpen && !checkoutOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="qb-focus fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-2xl px-5 py-3.5 text-white shadow-2xl transition sm:bottom-7"
          style={{ background: T.brand }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ShoppingBag size={19} />
          </div>

          <div className="text-left">
            <p className="qb-mono text-xs font-medium text-orange-100">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
            <p className="qb-mono text-sm font-extrabold">
              View Cart · ৳{cartTotal}
            </p>
          </div>

          <ChevronRight size={19} />
        </button>
      )}

      {/* ====================================================== */}
      {/* CART DRAWER OVERLAY */}
      {/* ====================================================== */}

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close cart"
          />

          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col shadow-2xl"
            style={{ background: T.paper }}
          >
            <div
              className="flex items-center justify-between px-5 py-5"
              style={{ borderBottom: `1px solid ${T.line}` }}
            >
              <div>
                <p
                  className="qb-mono text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: T.brandDark }}
                >
                  Your order
                </p>
                <h3
                  className="qb-display mt-1 text-xl font-extrabold"
                  style={{ color: T.ink }}
                >
                  Shopping Cart
                </h3>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="qb-focus flex h-10 w-10 items-center justify-center rounded-xl transition"
                style={{ background: T.bg, color: T.inkSoft }}
              >
                <X size={19} />
              </button>
            </div>

            <div
              className="px-5 py-4"
              style={{
                background: T.brandTint,
                borderBottom: `1px solid ${T.line}`,
              }}
            >
              <p
                className="qb-mono text-xs font-semibold uppercase tracking-wide"
                style={{ color: T.brandDark }}
              >
                Ordering from
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: T.ink }}>
                {restaurant.name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                    style={{ background: T.brandTint }}
                  >
                    🛒
                  </div>
                  <h4
                    className="qb-display mt-5 text-lg font-bold"
                    style={{ color: T.ink }}
                  >
                    Your cart is empty
                  </h4>
                  <p className="mt-2 text-sm" style={{ color: T.inkSoft }}>
                    Add something delicious from the menu.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.foodId}
                      className="rounded-2xl p-3"
                      style={{ border: `1px solid ${T.line}` }}
                    >
                      <div className="flex gap-3">
                        <div
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                          style={{ background: T.brandTint }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              🍴
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-2">
                            <h4
                              className="truncate text-sm font-bold"
                              style={{ color: T.ink }}
                            >
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.foodId)}
                              className="qb-focus transition"
                              style={{ color: T.inkSoft }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <p
                            className="qb-mono mt-1 text-sm font-bold"
                            style={{ color: T.brand }}
                          >
                            ৳{item.price}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => decreaseQuantity(item.foodId)}
                              className="qb-focus flex h-7 w-7 items-center justify-center rounded-lg transition"
                              style={{
                                border: `1px solid ${T.line}`,
                                color: T.ink,
                              }}
                            >
                              <Minus size={13} />
                            </button>

                            <span className="qb-mono w-6 text-center text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.foodId)}
                              className="qb-focus flex h-7 w-7 items-center justify-center rounded-lg text-white transition"
                              style={{ background: T.brand }}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className="mt-3 flex justify-between pt-3 text-sm"
                        style={{ borderTop: `1.5px dashed ${T.line}` }}
                      >
                        <span style={{ color: T.inkSoft }}>Item total</span>
                        <span
                          className="qb-mono font-bold"
                          style={{ color: T.ink }}
                        >
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div
                className="p-5"
                style={{
                  borderTop: `1px solid ${T.line}`,
                  background: T.paper,
                }}
              >
                <div className="qb-mono space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: T.inkSoft }}>Subtotal</span>
                    <span className="font-semibold" style={{ color: T.ink }}>
                      ৳{cartTotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: T.inkSoft }}>Delivery</span>
                    <span className="font-semibold" style={{ color: T.mint }}>
                      Free
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-3"
                    style={{ borderTop: `1.5px dashed ${T.line}` }}
                  >
                    <span className="font-bold" style={{ color: T.ink }}>
                      Total
                    </span>
                    <span
                      className="text-xl font-extrabold"
                      style={{ color: T.brand }}
                    >
                      ৳{cartTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={openCheckout}
                  className="qb-focus mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white shadow-lg transition"
                  style={{ background: T.brand }}
                >
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ====================================================== */}
      {/* CHECKOUT MODAL */}
      {/* ====================================================== */}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            onClick={() => !placingOrder && setCheckoutOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close checkout"
          />

          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl"
            style={{ background: T.paper }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${T.line}` }}
            >
              <div>
                <p
                  className="qb-mono text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: T.brandDark }}
                >
                  Almost there
                </p>
                <h3
                  className="qb-display mt-1 text-xl font-extrabold"
                  style={{ color: T.ink }}
                >
                  Delivery Details
                </h3>
              </div>

              <button
                onClick={() => !placingOrder && setCheckoutOpen(false)}
                className="qb-focus flex h-10 w-10 items-center justify-center rounded-xl transition"
                style={{ background: T.bg, color: T.inkSoft }}
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: T.ink }}
                  >
                    <User size={15} />
                    Your Name <span style={{ color: T.brand }}>*</span>
                  </label>
                  <input
                    name="name"
                    value={checkoutForm.name}
                    onChange={handleCheckoutChange}
                    placeholder="e.g. Jamal Uddin"
                    className="qb-focus w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                    style={{
                      border: `1px solid ${T.line}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: T.ink }}
                  >
                    <Phone size={15} />
                    Phone Number <span style={{ color: T.brand }}>*</span>
                  </label>
                  <input
                    name="phone"
                    value={checkoutForm.phone}
                    onChange={handleCheckoutChange}
                    placeholder="e.g. 01812345678"
                    className="qb-focus w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                    style={{
                      border: `1px solid ${T.line}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                    style={{ color: T.ink }}
                  >
                    <MapPin size={15} />
                    Delivery Address <span style={{ color: T.brand }}>*</span>
                  </label>
                  <textarea
                    name="address"
                    value={checkoutForm.address}
                    onChange={handleCheckoutChange}
                    placeholder="House, road, area, city"
                    rows={3}
                    className="qb-focus w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition"
                    style={{
                      border: `1px solid ${T.line}`,
                      background: T.paper,
                      color: T.ink,
                    }}
                  />

                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locatingUser}
                    className="qb-focus qb-mono mt-2 flex items-center gap-2 text-xs font-semibold transition disabled:opacity-60"
                    style={{ color: T.brand }}
                  >
                    {locatingUser ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Navigation size={14} />
                    )}
                    {deliveryLocation
                      ? "Location captured — your rider can find you precisely"
                      : "Share my precise GPS location"}
                  </button>
                </div>

                {checkoutError && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      border: "1px solid #FCA5A5",
                      background: "#FEF2F2",
                      color: "#DC2626",
                    }}
                  >
                    {checkoutError}
                  </div>
                )}

                <div
                  className="qb-mono rounded-xl p-4"
                  style={{ border: `1.5px dashed ${T.line}`, background: T.bg }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: T.inkSoft }}>
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold" style={{ color: T.ink }}>
                      ৳{cartTotal}
                    </span>
                  </div>
                  <div
                    className="mt-2 flex justify-between pt-2"
                    style={{ borderTop: `1px solid ${T.line}` }}
                  >
                    <span className="font-bold" style={{ color: T.ink }}>
                      Total
                    </span>
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: T.brand }}
                    >
                      ৳{cartTotal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5" style={{ borderTop: `1px solid ${T.line}` }}>
              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="qb-focus flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: T.brand }}
              >
                {placingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing your order...
                  </>
                ) : (
                  <>
                    Place Order · ৳{cartTotal}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
