"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiPhone,
  FiImage,
  FiFileText,
  FiCheckCircle,
  FiLoader,
  FiCheck,
  FiStar,
} from "react-icons/fi";

// Merchant-onboarding tokens: professional and trust-building (this is
// someone setting up their livelihood, not browsing for food), but the
// preview card intentionally borrows the ticket motif from the customer
// app — because that IS what this form produces.
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
  gold: "#E7A100",
};

export default function Page() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create restaurant");
        return;
      }

      setMessage("Restaurant created successfully! Redirecting...");

      setFormData({
        name: "",
        description: "",
        image: "",
        address: "",
        phone: "",
      });

      // ⚠️ Adjust `data.restaurant._id` if your API response shape differs
      setTimeout(() => {
        router.push(`/category?restaurantId=${data.restaurant._id}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checklist = useMemo(
    () => [
      { label: "Restaurant name", done: formData.name.trim().length > 0 },
      { label: "Description", done: formData.description.trim().length > 0 },
      { label: "Address", done: formData.address.trim().length > 0 },
      { label: "Phone number", done: formData.phone.trim().length > 0 },
    ],
    [formData],
  );

  const doneCount = checklist.filter((c) => c.done).length;

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
      `}</style>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p
            className="rq-mono mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: M.brand }}
          >
            QuickBite for Restaurants
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            List your restaurant
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm leading-6 sm:text-base"
            style={{ color: M.inkSoft }}
          >
            Tell us about your restaurant. Once approved, customers can start
            finding and ordering from you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* ================= FORM ================= */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: M.paper, border: `1px solid ${M.line}` }}
          >
            <div
              className="px-5 py-5 sm:px-8"
              style={{ borderBottom: `1px solid ${M.line}` }}
            >
              <h2 className="text-lg font-bold">Restaurant information</h2>
              <p className="mt-1 text-sm" style={{ color: M.inkSoft }}>
                This is what customers will see when they browse QuickBite.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Restaurant name <span style={{ color: M.brand }}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Burger House"
                    required
                    className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      border: `1px solid ${M.line}`,
                      background: M.paper,
                    }}
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
                    placeholder="Tell customers about your restaurant, food, specialties, etc."
                    required
                    rows={5}
                    className="rq-input w-full resize-none rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      border: `1px solid ${M.line}`,
                      background: M.paper,
                    }}
                  />
                </div>

                <div className="md:col-span-2">
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
                    type="text"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/restaurant.jpg"
                    className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      border: `1px solid ${M.line}`,
                      background: M.paper,
                    }}
                  />
                  <p className="mt-2 text-xs" style={{ color: M.inkSoft }}>
                    Optional — without one, customers see a placeholder like the
                    preview on the right.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <FiMapPin size={16} />
                    Address <span style={{ color: M.brand }}>*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Restaurant address"
                    required
                    className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      border: `1px solid ${M.line}`,
                      background: M.paper,
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <FiPhone size={16} />
                    Phone number <span style={{ color: M.brand }}>*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                    className="rq-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      border: `1px solid ${M.line}`,
                      background: M.paper,
                    }}
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
                    border: `1px solid #B7E4D5`,
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
                  className="w-full rounded-xl px-6 py-3 text-sm font-medium transition hover:bg-gray-50 sm:w-auto"
                  style={{ border: `1px solid ${M.line}`, color: M.ink }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  style={{ background: M.brand }}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create restaurant"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ================= SIDEBAR: preview + checklist ================= */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
            {/* Live preview */}
            <div>
              <p
                className="rq-mono mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: M.inkSoft }}
              >
                How customers will see you
              </p>

              <div
                className="overflow-hidden rounded-3xl"
                style={{ background: M.paper, border: `1px solid ${M.line}` }}
              >
                <div
                  className="relative flex h-32 items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${M.brand}, #C2340A)`,
                  }}
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-5xl">🍽️</span>
                  )}

                  <div className="absolute left-3 top-3">
                    <span
                      className="rq-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: M.mintTint, color: M.mint }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: M.mint }}
                      />
                      Open now
                    </span>
                  </div>

                  <div
                    className="rq-mono absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      color: M.ink,
                    }}
                  >
                    <FiStar size={11} style={{ color: M.gold }} />
                    New
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-base font-bold">
                    {formData.name || "Your restaurant name"}
                  </h4>
                  <p
                    className="mt-1.5 line-clamp-2 text-xs leading-5"
                    style={{ color: M.inkSoft }}
                  >
                    {formData.description ||
                      "Your description will appear here — tell customers what makes your food worth ordering."}
                  </p>

                  <div
                    className="rq-mono mt-3 space-y-1 text-[11px]"
                    style={{ color: M.inkSoft }}
                  >
                    <p className="flex items-center gap-1.5">
                      <FiMapPin size={11} style={{ color: M.brand }} />
                      {formData.address || "Address pending"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FiPhone size={11} style={{ color: M.brand }} />
                      {formData.phone || "Phone pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div
              className="rounded-2xl p-5"
              style={{ background: M.paper, border: `1px solid ${M.line}` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Required details</h3>
                <span
                  className="rq-mono text-xs font-semibold"
                  style={{
                    color: doneCount === checklist.length ? M.mint : M.inkSoft,
                  }}
                >
                  {doneCount}/{checklist.length}
                </span>
              </div>

              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: M.brandTint }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(doneCount / checklist.length) * 100}%`,
                    background:
                      doneCount === checklist.length ? M.mint : M.brand,
                  }}
                />
              </div>

              <ul className="mt-4 space-y-2.5">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={
                        item.done
                          ? { background: M.mintTint, color: M.mint }
                          : {
                              background: M.bg,
                              color: M.inkSoft,
                              border: `1px solid ${M.line}`,
                            }
                      }
                    >
                      {item.done && <FiCheck size={12} />}
                    </span>
                    <span style={{ color: item.done ? M.ink : M.inkSoft }}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="mt-4 text-xs leading-5"
                style={{ color: M.inkSoft }}
              >
                An admin reviews every new restaurant before it goes live for
                customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
