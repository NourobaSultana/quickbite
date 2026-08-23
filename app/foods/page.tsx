"use client";

import { FormEvent, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiShoppingBag,
  FiPlus,
  FiLoader,
  FiCheckCircle,
  FiList,
  FiArrowLeft,
  FiDollarSign,
  FiImage,
  FiFileText,
  FiCheck,
} from "react-icons/fi";

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  categoryId: string;
  createdAt: string;
}

// Same merchant-onboarding tokens as the restaurant + category pages —
// this is step 3 of the same setup flow.
const M = {
  bg: "#FAFAF9",
  paper: "#FFFFFF",
  ink: "#14161A",
  inkSoft: "rgba(20,22,26,0.56)",
  line: "#E7E5E1",
  brand: "#FF4E1F",
  brandTint: "#FFF0E9",
  mint: "#0E7A5F",
  mintTint: "#E9F5F0",
};

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Restaurant", "Categories", "Menu items"];

  return (
    <div className="mb-8 flex items-center gap-2">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < step;
        const current = n === step;

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className="rq-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={
                  done
                    ? { background: M.mint, color: "#fff" }
                    : current
                      ? { background: M.brand, color: "#fff" }
                      : {
                          background: M.paper,
                          color: M.inkSoft,
                          border: `1px solid ${M.line}`,
                        }
                }
              >
                {done ? <FiCheck size={12} /> : n}
              </span>
              <span
                className="hidden text-xs font-semibold sm:inline"
                style={{ color: current ? M.ink : M.inkSoft }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className="h-px w-6 sm:w-10"
                style={{ background: done ? M.mint : M.line }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FoodsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const categoryId = searchParams.get("categoryId");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });

  const [foods, setFoods] = useState<FoodItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFoods = useCallback(async () => {
    if (!restaurantId || !categoryId) {
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/foods?restaurantId=${restaurantId}&categoryId=${categoryId}`,
        { credentials: "include" },
      );

      // If you haven't added a GET handler to app/api/foods/route.ts yet,
      // this will 404 — add one following the same pattern as your
      // category GET route, filtering by restaurantId and categoryId.
      const data = await res.json();
      if (data.success) setFoods(data.foods);
    } catch (err) {
      console.error("Failed to fetch foods:", err);
    } finally {
      setFetching(false);
    }
  }, [restaurantId, categoryId]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative");
      return;
    }

    if (!restaurantId || !categoryId) {
      setError(
        "Restaurant or category is missing. Please go back and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          image: formData.image.trim(),
          restaurantId,
          categoryId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to add food item");
        return;
      }

      setMessage("Food item added successfully!");
      setFormData({ name: "", description: "", price: "", image: "" });
      fetchFoods();
    } catch (err) {
      console.error("Create food error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: M.bg,
        color: M.ink,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .rq-mono { font-family: 'IBM Plex Mono', monospace; }
        .rq-input { transition: border-color .15s, box-shadow .15s; }
        .rq-input:focus { border-color: ${M.brand} !important; box-shadow: 0 0 0 3px ${M.brandTint}; }
        .rq-food-card { transition: border-color .15s, background .15s, transform .2s; }
        .rq-food-card:hover { border-color: ${M.brand} !important; transform: translateY(-2px); }
      `}</style>

      <div className="mx-auto max-w-5xl">
        <StepIndicator step={3} />

        {/* Header */}
        <div className="mb-8">
          <p
            className="rq-mono mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: M.brand }}
          >
            QuickBite for Restaurants
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Add menu items
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm leading-6 sm:text-base"
            style={{ color: M.inkSoft }}
          >
            Add dishes to this category with pricing, description, and an image.
          </p>
        </div>

        {(!restaurantId || !categoryId) && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#DC2626",
            }}
          >
            Restaurant or category is missing. Please go back to your categories
            and select one first.
          </div>
        )}

        {/* Add Food Form */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: M.paper, border: `1px solid ${M.line}` }}
        >
          <div
            className="px-5 py-5 sm:px-8"
            style={{ borderBottom: `1px solid ${M.line}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: M.brandTint, color: M.brand }}
              >
                <FiShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Food details</h2>
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  Provide accurate details for this menu item.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Food name <span style={{ color: M.brand }}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Cheese Burger"
                  required
                  className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                  style={{ border: `1px solid ${M.line}`, background: M.paper }}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <FiFileText size={16} />
                  Description <span style={{ color: M.brand }}>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the ingredients, taste, and portion size"
                  required
                  rows={4}
                  className="rq-input w-full resize-none rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                  style={{ border: `1px solid ${M.line}`, background: M.paper }}
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <FiDollarSign size={16} />
                  Price (৳) <span style={{ color: M.brand }}>*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 350"
                  required
                  className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                  style={{ border: `1px solid ${M.line}`, background: M.paper }}
                />
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <FiImage size={16} />
                  Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/food.jpg"
                  className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                  style={{ border: `1px solid ${M.line}`, background: M.paper }}
                />
              </div>
            </div>

            {error && (
              <div
                className="mt-6 rounded-xl px-4 py-3 text-sm"
                style={{
                  border: "1px solid #FCA5A5",
                  background: "#FEF2F2",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{
                  border: "1px solid #B7E4D5",
                  background: M.mintTint,
                  color: M.mint,
                }}
              >
                <FiCheckCircle size={18} />
                {message}
              </div>
            )}

            <div
              className="mt-8 flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end"
              style={{ borderTop: `1px solid ${M.line}` }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition hover:bg-gray-50 sm:w-auto"
                style={{ border: `1px solid ${M.line}`, color: M.ink }}
              >
                <FiArrowLeft size={16} />
                Back
              </button>

              <button
                type="submit"
                disabled={loading || !restaurantId || !categoryId}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                style={{ background: M.brand }}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Add food
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Food List */}
        <div
          className="mt-6 overflow-hidden rounded-2xl"
          style={{ background: M.paper, border: `1px solid ${M.line}` }}
        >
          <div
            className="flex items-center justify-between px-5 py-5 sm:px-8"
            style={{ borderBottom: `1px solid ${M.line}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: M.brandTint, color: M.brand }}
              >
                <FiList size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Foods in this category</h2>
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  All dishes currently added under this category.
                </p>
              </div>
            </div>

            {!fetching && foods.length > 0 && (
              <span
                className="rq-mono rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: M.brandTint, color: M.brand }}
              >
                {foods.length}
              </span>
            )}
          </div>

          <div className="p-5 sm:p-8">
            {fetching ? (
              <p className="text-sm" style={{ color: M.inkSoft }}>
                Loading foods...
              </p>
            ) : foods.length === 0 ? (
              <div
                className="rounded-xl px-5 py-10 text-center"
                style={{ border: `1.5px dashed ${M.line}` }}
              >
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  No food items added yet. Add your first one above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    className="rq-food-card flex gap-4 rounded-xl p-4"
                    style={{ border: `1px solid ${M.line}` }}
                  >
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                      style={{ background: M.brandTint, color: M.brand }}
                    >
                      {food.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={food.image}
                          alt={food.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiShoppingBag size={22} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-bold">
                          {food.name}
                        </h3>
                        <span
                          className="rq-mono whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold"
                          style={{ background: M.brandTint, color: M.brand }}
                        >
                          ৳{food.price.toFixed(2)}
                        </span>
                      </div>
                      <p
                        className="mt-1 line-clamp-2 text-xs"
                        style={{ color: M.inkSoft }}
                      >
                        {food.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div
          className="mt-6 rounded-2xl p-5"
          style={{ background: M.brandTint, border: "1px solid #FFD9C4" }}
        >
          <h3 className="text-sm font-bold">Before you submit</h3>
          <ul className="mt-3 space-y-1.5 text-sm" style={{ color: M.inkSoft }}>
            <li>• Food names must be unique within this category.</li>
            <li>• Price must be zero or higher.</li>
            <li>
              • Image URL is optional but recommended for better presentation.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function FoodsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <FoodsContent />
    </Suspense>
  );
}
