"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiPhone,
  FiImage,
  FiFileText,
  FiUser,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

export default function page() {
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Redirect to category page with the new restaurant's ID
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-500">
            QuickBite Restaurant
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Create Your Restaurant
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Add your restaurant information to start receiving customers through
            QuickBite.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Card Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FiUser size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Restaurant Information
                </h2>

                <p className="text-sm text-gray-500">
                  Please provide accurate information about your restaurant.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Restaurant Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Restaurant Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Burger House"
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
                  Restaurant Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your restaurant, food, specialties, etc."
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiImage size={16} />
                  Restaurant Image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/restaurant.jpg"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Optional. You can add an image URL for your restaurant.
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiMapPin size={16} />
                  Address <span className="text-red-500">*</span>
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Restaurant address"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiPhone size={16} />
                  Phone Number <span className="text-red-500">*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  required
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
                className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Restaurant"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <h3 className="font-semibold text-gray-900">Before you submit</h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>• Make sure your restaurant name is correct.</li>
            <li>• Provide your actual restaurant address.</li>
            <li>• Use an active phone number.</li>
            <li>• Restaurant approval may be required by the admin.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
