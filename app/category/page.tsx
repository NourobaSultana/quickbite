"use client";

import { FormEvent, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiTag,
  FiPlus,
  FiLoader,
  FiCheckCircle,
  FiList,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

interface CategoryItem {
  _id: string;
  name: string;
  restaurantId: string;
  createdAt: string;
}

// Same merchant-onboarding tokens as the "Create your restaurant" page —
// this is step 2 of the same setup flow, not a new surface.
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

function CategoryContent() {
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
      if (data.success) setCategories(data.categories);
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
        .rq-row { transition: background .15s ease; }
        .rq-row:hover { background: ${M.bg}; }
      `}</style>

      <div className="mx-auto max-w-3xl">
        <StepIndicator step={2} />

        {/* Header */}
        <div className="mb-8">
          <p
            className="rq-mono mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: M.brand }}
          >
            QuickBite for Restaurants
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Menu categories
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm leading-6 sm:text-base"
            style={{ color: M.inkSoft }}
          >
            Group your menu into categories — burger, pizza, and more. You'll
            add food items to each one next.
          </p>
        </div>

        {!restaurantId && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#DC2626",
            }}
          >
            No restaurant selected. Please create a restaurant first.
          </div>
        )}

        {/* Add Category Form */}
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
                <FiTag size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add menu category</h2>
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  Separate multiple names with commas — e.g. Burger, Pizza,
                  Pasta.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Category name <span style={{ color: M.brand }}>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Burger, Pizza, Pasta"
              className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              style={{ border: `1px solid ${M.line}`, background: M.paper }}
            />

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
                disabled={loading || !restaurantId}
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
                    Add category
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Category List */}
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
                <h2 className="text-lg font-bold">Your categories</h2>
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  Click a category to add its food items.
                </p>
              </div>
            </div>

            {!fetching && categories.length > 0 && (
              <span
                className="rq-mono rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: M.brandTint, color: M.brand }}
              >
                {categories.length}
              </span>
            )}
          </div>

          <div className="p-5 sm:p-8">
            {fetching ? (
              <p className="text-sm" style={{ color: M.inkSoft }}>
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <div
                className="rounded-xl px-5 py-10 text-center"
                style={{ border: `1.5px dashed ${M.line}` }}
              >
                <p className="text-sm" style={{ color: M.inkSoft }}>
                  No categories added yet. Add your first one above.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="rq-row flex items-center justify-between rounded-xl px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: M.brandTint, color: M.brand }}
                      >
                        <FiTag size={15} />
                      </span>
                      <span className="text-sm font-semibold">{cat.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/foods?restaurantId=${restaurantId}&categoryId=${cat._id}`,
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:bg-orange-50"
                      style={{ border: `1px solid ${M.brand}`, color: M.brand }}
                    >
                      Add food
                      <FiArrowRight size={13} />
                    </button>
                  </li>
                ))}
              </ul>
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
            <li>• Category names must be unique within this restaurant.</li>
            <li>
              • After creating a category, you can add food items to it right
              away.
            </li>
            <li>
              • You can always add more foods to any category later using "Add
              food".
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
