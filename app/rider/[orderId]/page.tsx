"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Package,
  Navigation,
  Loader2,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

interface RiderInfo {
  _id: string;
  name: string;
  phone: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: string;
  riderId: RiderInfo | null;
}

const STATUS_FLOW = [
  { key: "accepted", label: "Accept Order" },
  { key: "picked_up", label: "Picked Up" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
];

export default function RiderOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const watchIdRef = useRef<number | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Start sharing GPS location once we know the rider's id.
  useEffect(() => {
    const riderId = order?.riderId?._id;
    if (!riderId) return;

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        setSharingLocation(true);
        setLocationError("");

        try {
          await fetch(`/api/riders/${riderId}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
        } catch (err) {
          console.error("Failed to push location:", err);
        }
      },
      (error) => {
        setSharingLocation(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Enable GPS to share your position with the customer."
            : "Unable to get your location. Make sure GPS is turned on.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [order?.riderId?._id]);

  const advanceStatus = async (nextStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Loader2 size={17} className="animate-spin text-orange-500" />
          Loading order...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4 text-center">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const currentStepIndex = STATUS_FLOW.findIndex((s) => s.key === order.status);

  const nextStep =
    order.status === "pending"
      ? STATUS_FLOW[0]
      : currentStepIndex >= 0 && currentStepIndex < STATUS_FLOW.length - 1
        ? STATUS_FLOW[currentStepIndex + 1]
        : null;

  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Rider Panel
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
            Delivery #{order._id.slice(-6).toUpperCase()}
          </h1>
        </div>

        {/* Location sharing status */}
        <div
          className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
            sharingLocation
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-orange-100 bg-orange-50 text-orange-600"
          }`}
        >
          <Navigation
            size={17}
            className={sharingLocation ? "animate-pulse" : ""}
          />
          {sharingLocation
            ? "Sharing your live location with the customer"
            : locationError || "Waiting for GPS signal..."}
        </div>

        {/* Delivery details */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <MapPin size={16} className="text-orange-500" />
              Deliver to
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {order.deliveryAddress}
            </p>
          </div>

          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Customer
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {order.customerName}
                </p>
              </div>

              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                <Phone size={14} />
                Call
              </a>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Package size={16} className="text-orange-500" />
              Items
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.foodId}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ৳{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-lg font-extrabold text-orange-500">
                ৳{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Status progress */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <ClipboardList size={16} className="text-orange-500" />
            Order Status
          </div>

          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((step, index) => {
              const done = index <= currentStepIndex;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {done ? <CheckCircle2 size={16} /> : index + 1}
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div
                      className={`mx-1 h-1 flex-1 rounded ${
                        index < currentStepIndex
                          ? "bg-orange-500"
                          : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase text-gray-400">
            {STATUS_FLOW.map((step) => (
              <span key={step.key} className="w-8 text-center">
                {step.label.split(" ")[0]}
              </span>
            ))}
          </div>

          {isCancelled ? (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
              This order was cancelled.
            </p>
          ) : isDelivered ? (
            <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              Delivered successfully. Thank you!
            </p>
          ) : nextStep ? (
            <button
              onClick={() => advanceStatus(nextStep.key)}
              disabled={updating}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
            >
              {updating ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}
              Mark as {nextStep.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
