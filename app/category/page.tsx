"use client";

import { FormEvent, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiTag,
  FiPlus,
  FiLoader,
  FiCheckCircle,
  FiList,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

interface CategoryItem {
  _id: string;
  name: string;
  restaurantId: string;
  createdAt: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const [name, setName] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) {
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(`/api/categories?restaurantId=${restaurantId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setFetching(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // Split on commas, trim whitespace, drop empties, dedupe.
    const names = Array.from(
      new Set(
        name
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0),
      ),
    );

    if (names.length === 0) {
      setError("Please enter at least one category name");
      return;
    }

    if (!restaurantId) {
      setError(
        "Restaurant ID is missing. Please create your restaurant first.",
      );
      return;
    }

    setLoading(true);

    try {
      const created: CategoryItem[] = [];
      const failed: string[] = [];

      for (const n of names) {
        try {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: n, restaurantId }),
          });

          const data = await res.json();

          if (data.success) {
            created.push(data.category);
          } else {
            failed.push(n);
          }
        } catch {
          failed.push(n);
        }
      }

      if (created.length > 0) {
        setCategories((prev) => [...prev, ...created]);
        setName("");

        if (failed.length > 0) {
          setMessage(`Added ${created.length} categories.`);
          setError(`Could not add: ${failed.join(", ")}`);
        } else {
          setMessage(
            names.length === 1
              ? "Category created!"
              : `${created.length} categories created!`,
          );
        }
      } else {
        setError(`Failed to add: ${failed.join(", ")}`);
      }
    } catch (err) {
      console.error("Create category error:", err);
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
            Menu Categories
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Add the food items your restaurant serves — burger, pizza, and more.
          </p>
        </div>

        {!restaurantId && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            No restaurant selected. Please create a restaurant first.
          </div>
        )}

        {/* Main Card - Add Category Form */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Card Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FiTag size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Menu Category
                </h2>

                <p className="text-sm text-gray-500">
                  Add categories like burger, pizza, pasta, etc. to your menu.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category Name <span className="text-red-500">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Burger, Pizza, Pasta"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
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
                disabled={loading || !restaurantId}
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
                    Add Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Category List Card */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FiList size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Categories
                </h2>
                <p className="text-sm text-gray-500">
                  Click a category to add or view its food items.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {fetching ? (
              <p className="text-sm text-gray-400">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-400">
                No categories added yet. Add your first one above.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                        <FiTag size={14} />
                      </span>
                      <span className="font-medium text-gray-800">
                        {cat.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/foods?restaurantId=${restaurantId}&categoryId=${cat._id}`,
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50"
                    >
                      Add Food
                      <FiArrowRight size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <h3 className="font-semibold text-gray-900">Before you submit</h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>• Category names must be unique within this restaurant.</li>
            <li>
              • After creating a category, you'll be taken to add food items to
              it.
            </li>
            <li>
              • You can add more foods to any category later using the "Add
              Food" button.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
