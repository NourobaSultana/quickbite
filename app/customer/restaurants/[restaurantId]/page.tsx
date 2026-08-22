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
  const { logout } = useAuth();

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      // Clear the cart for this restaurant now that the order exists.
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
    <div className="min-h-screen bg-[#fffaf5]">
      {/* ====================================================== */}
      {/* RESTAURANT HERO */}
      {/* ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/customer")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-orange-500"
        >
          <ArrowLeft size={17} />
          Back to restaurants
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="relative h-64 overflow-hidden sm:h-80 lg:h-[360px]">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <span className="text-7xl">🍽️</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-green-600 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Open Now
              </span>
            </div>

            <div className="absolute bottom-6 left-5 right-5 text-white sm:left-8 sm:bottom-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  4.8
                </span>

                <span className="rounded-lg bg-black/30 px-2.5 py-1.5 text-xs font-medium backdrop-blur">
                  Restaurant
                </span>
              </div>

              <h2 className="text-3xl font-extrabold sm:text-4xl">
                {restaurant.name}
              </h2>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-7">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {restaurant.address || "Location unavailable"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Phone size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Contact
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {restaurant.phone || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Clock size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Availability
                </p>

                <p className="mt-1 text-sm font-medium text-green-600">
                  Currently available
                </p>
              </div>
            </div>
          </div>

          {restaurant.description && (
            <div className="border-t border-gray-100 px-5 py-5 sm:px-7">
              <p className="text-sm leading-7 text-gray-500">
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
              Our Menu
            </p>

            <h3 className="mt-2 text-3xl font-extrabold text-gray-900">
              Choose something delicious
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Explore the menu and add your favorite items to your cart.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={19} className="shrink-0 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food..."
              className="h-12 w-full bg-transparent px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
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
                className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-orange-500 text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-500"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                    selectedCategory === category._id
                      ? "bg-orange-500 text-white shadow-md"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-500"
                  }`}
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
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="h-52 animate-pulse bg-gray-200" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                  <div className="h-11 animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
              🍴
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              No food items found
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {search
                ? "Try searching for another food item."
                : "This restaurant hasn't added food items to this category yet."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
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
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden bg-orange-50">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <UtensilsCrossed
                          size={55}
                          className="text-orange-300"
                        />
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 rounded-xl bg-white px-3 py-2 text-lg font-extrabold text-orange-500 shadow-md">
                      ৳{food.price}
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="text-lg font-bold text-gray-900 transition group-hover:text-orange-500">
                      {food.name}
                    </h4>

                    <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-500">
                      {food.description || "A delicious choice from our menu."}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span>4.8</span>
                      <span className="text-gray-300">•</span>
                      <span>Popular choice</span>
                    </div>

                    <div className="mt-5">
                      {!cartItem ? (
                        <button
                          onClick={() => addToCart(food)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
                        >
                          <Plus size={18} />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl bg-orange-50 p-2">
                          <button
                            onClick={() => decreaseQuantity(food._id)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm transition hover:bg-orange-100"
                          >
                            <Minus size={17} />
                          </button>

                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Quantity
                            </p>

                            <p className="text-lg font-extrabold text-gray-900">
                              {cartItem.quantity}
                            </p>
                          </div>

                          <button
                            onClick={() => increaseQuantity(food._id)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm transition hover:bg-orange-600"
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
          className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-orange-500 px-5 py-3.5 text-white shadow-2xl transition hover:bg-orange-600 sm:bottom-7"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ShoppingBag size={19} />
          </div>

          <div className="text-left">
            <p className="text-xs font-medium text-orange-100">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>

            <p className="text-sm font-extrabold">View Cart · ৳{cartTotal}</p>
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

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                  Your order
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-gray-900">
                  Shopping Cart
                </h3>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="border-b border-orange-100 bg-orange-50 px-5 py-4">
              <p className="text-xs font-semibold text-orange-500">
                Ordering from
              </p>

              <p className="mt-1 text-sm font-bold text-gray-900">
                {restaurant.name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
                    🛒
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-gray-900">
                    Your cart is empty
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Add something delicious from the menu.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.foodId}
                      className="rounded-2xl border border-gray-100 p-3"
                    >
                      <div className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-orange-50">
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
                            <h4 className="truncate text-sm font-bold text-gray-900">
                              {item.name}
                            </h4>

                            <button
                              onClick={() => removeFromCart(item.foodId)}
                              className="text-gray-400 transition hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <p className="mt-1 text-sm font-bold text-orange-500">
                            ৳{item.price}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => decreaseQuantity(item.foodId)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="w-6 text-center text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.foodId)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
                        <span className="text-gray-500">Item total</span>

                        <span className="font-bold text-gray-900">
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      ৳{cartTotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-extrabold text-orange-500">
                      ৳{cartTotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={openCheckout}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600"
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

          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500">
                  Almost there
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-gray-900">
                  Delivery Details
                </h3>
              </div>

              <button
                onClick={() => !placingOrder && setCheckoutOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User size={15} />
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={checkoutForm.name}
                    onChange={handleCheckoutChange}
                    placeholder="e.g. Jamal Uddin"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone size={15} />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={checkoutForm.phone}
                    onChange={handleCheckoutChange}
                    placeholder="e.g. 01812345678"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={15} />
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={checkoutForm.address}
                    onChange={handleCheckoutChange}
                    placeholder="House, road, area, city"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locatingUser}
                    className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-500 transition hover:text-orange-600 disabled:opacity-60"
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
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {checkoutError}
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ৳{cartTotal}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-extrabold text-orange-500">
                      ৳{cartTotal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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
