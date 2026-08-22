"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiUser,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import Link from "next/link";

interface Rider {
  _id: string;
  name: string;
  phone: string;
  vehicle?: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  } | null;
}

interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  riderId?: Rider | string | null;
  restaurantId?:
    | {
        _id: string;
        name: string;
        address?: string;
        phone?: string;
        image?: string;
      }
    | string;

  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;

  deliveryLocation?: {
    lat: number;
    lng: number;
  } | null;

  status:
    | "pending"
    | "accepted"
    | "picked_up"
    | "on_the_way"
    | "delivered"
    | "cancelled";

  createdAt: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  on_the_way: {
    label: "On The Way",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function RiderPage() {
  const searchParams = useSearchParams();

  const riderId = searchParams.get("riderId");

  const [rider, setRider] = useState<Rider | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRiderData = useCallback(async () => {
    if (!riderId) {
      setLoading(false);
      setError("Rider ID is missing.");
      return;
    }

    try {
      setError("");

      const [ordersResponse, riderResponse] = await Promise.all([
        fetch(`/api/orders?riderId=${riderId}`, {
          credentials: "include",
        }),

        fetch(`/api/riders/${riderId}`, {
          credentials: "include",
        }),
      ]);

      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      } else {
        setError(ordersData.message || "Failed to load orders.");
      }

      if (riderResponse.ok) {
        const riderData = await riderResponse.json();

        if (riderData.success) {
          setRider(riderData.rider);
        }
      }
    } catch (error) {
      console.error("Rider dashboard error:", error);
      setError("Unable to load rider dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchRiderData();
  }, [fetchRiderData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRiderData();
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter((order) => order.status === "pending").length,

      active: orders.filter((order) =>
        ["accepted", "picked_up", "on_the_way"].includes(order.status),
      ).length,

      delivered: orders.filter((order) => order.status === "delivered").length,
    };
  }, [orders]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded bg-gray-200" />
            <div className="mt-3 h-5 w-96 rounded bg-gray-200" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-32 rounded-2xl bg-white" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!riderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <FiAlertCircle className="mx-auto text-red-500" size={42} />

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Rider ID Required
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please open the rider dashboard with a valid rider ID.
          </p>

          <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            /rider?riderId=YOUR_RIDER_ID
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              QuickBite Rider
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Welcome{rider?.name ? `, ${rider.name}` : ""}! 👋
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your assigned deliveries and keep track of your orders.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <FiRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Rider Information */}
        {rider && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <FiUser size={25} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">{rider.name}</h2>

                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FiPhone size={14} />
                      {rider.phone}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <FiTruck size={14} />
                      {rider.vehicle || "Motorcycle"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    rider.isAvailable
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      rider.isAvailable ? "bg-green-500" : "bg-orange-500"
                    }`}
                  />

                  {rider.isAvailable ? "Available" : "Currently Delivering"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats.total}
            icon={<FiPackage size={21} />}
            iconClass="bg-orange-50 text-orange-500"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<FiClock size={21} />}
            iconClass="bg-yellow-50 text-yellow-600"
          />

          <StatCard
            title="Active Deliveries"
            value={stats.active}
            icon={<FiTruck size={21} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon={<FiCheckCircle size={21} />}
            iconClass="bg-green-50 text-green-600"
          />
        </div>

        {/* Orders */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assigned Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders currently assigned to you.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
              <FiPackage size={42} className="mx-auto text-gray-300" />

              <h3 className="mt-4 font-semibold text-gray-900">
                No assigned orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                New orders assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status];

                const restaurant =
                  typeof order.restaurantId === "object"
                    ? order.restaurantId
                    : null;

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Order Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-gray-900">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div className="flex items-start gap-2">
                            <FiUser
                              className="mt-0.5 text-gray-400"
                              size={16}
                            />

                            <div>
                              <p className="font-medium text-gray-800">
                                {order.customerName}
                              </p>

                              <p className="text-gray-500">
                                {order.customerPhone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <FiMapPin
                              className="mt-0.5 text-gray-400"
                              size={16}
                            />

                            <div>
                              <p className="font-medium text-gray-800">
                                Delivery Address
                              </p>

                              <p className="text-gray-500">
                                {order.deliveryAddress}
                              </p>
                            </div>
                          </div>
                        </div>

                        {restaurant && (
                          <p className="mt-4 text-sm text-gray-500">
                            Restaurant:{" "}
                            <span className="font-medium text-gray-800">
                              {restaurant.name}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Right */}
                      <div className="flex items-center justify-between gap-5 border-t border-gray-100 pt-4 lg:min-w-[220px] lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                        <div>
                          <p className="text-xs text-gray-400">Order Total</p>

                          <p className="text-xl font-bold text-gray-900">
                            ৳{order.totalAmount}
                          </p>
                        </div>

                        <Link
                          href={`/rider/${order._id}`}
                          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                          View Order
                          <FiArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
