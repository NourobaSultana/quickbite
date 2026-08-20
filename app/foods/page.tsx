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
  // kjhfkjhfkj
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

      if (data.success) {
        setFoods(data.foods);
      }
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-500">
            QuickBite Restaurant
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Add Food Items Please
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Add dishes to this category with pricing, description, and an image.
          </p>
        </div>

        {(!restaurantId || !categoryId) && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            Restaurant or category is missing. Please go back to your categories
            and select one first.
          </div>
        )}

        {/* Main Card - Add Food Form */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Card Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FiShoppingBag size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Food Details
                </h2>
                <p className="text-sm text-gray-500">
                  Provide accurate details for this menu item.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Food Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Food Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Cheese Burger"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiFileText size={16} />
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the ingredients, taste, and portion size"
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiDollarSign size={16} />
                  Price <span className="text-red-500">*</span>
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 9.99"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <FiCheckCircle size={18} />
                {message}
              </div>
            )}

            {/* Submit */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                <FiArrowLeft size={16} />
                Back
              </button>

              <button
                type="submit"
                disabled={loading || !restaurantId || !categoryId}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Add Food
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Food List Card */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FiList size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Foods in This Category
                </h2>
                <p className="text-sm text-gray-500">
                  All dishes currently added under this category.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {fetching ? (
              <p className="text-sm text-gray-400">Loading foods...</p>
            ) : foods.length === 0 ? (
              <p className="text-sm text-gray-400">
                No food items added yet. Add your first one above.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    className="flex gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-orange-100 hover:bg-orange-50/30"
                  >
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-orange-500">
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
                        <h3 className="truncate font-semibold text-gray-900">
                          {food.name}
                        </h3>
                        <span className="whitespace-nowrap text-sm font-semibold text-orange-600">
                          ${food.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {food.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <h3 className="font-semibold text-gray-900">Before you submit</h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-600">
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
