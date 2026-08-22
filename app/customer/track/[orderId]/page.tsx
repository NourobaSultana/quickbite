"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  Bike,
  PackageCheck,
} from "lucide-react";
import { haversineDistanceKm, estimateEtaMinutes } from "@/lib/geo";

interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

interface RiderLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

interface Rider {
  _id: string;
  name: string;
  phone: string;
  vehicle?: string;
  currentLocation?: RiderLocation;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLocation?: { lat: number; lng: number };
  status: string;
  riderId: Rider | null;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: PackageCheck },
  { key: "accepted", label: "Rider Assigned", icon: CheckCircle2 },
  { key: "picked_up", label: "Picked Up", icon: PackageCheck },
  { key: "on_the_way", label: "On The Way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

declare global {
  interface Window {
    L: any;
  }
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // Poll order details every few seconds.
  useEffect(() => {
    if (!orderId) return;

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

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Load Leaflet (map library) from a CDN once.
  useEffect(() => {
    if (window.L || document.getElementById("leaflet-script")) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "leaflet-script";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Initialize / update the map whenever rider or destination location changes.
  useEffect(() => {
    if (!order || !mapRef.current) return;

    const riderLoc = order.riderId?.currentLocation;
    const destLoc = order.deliveryLocation;

    // Fallback center (Dhaka) so the map always renders something,
    // even before we have a real rider or delivery location.
    const FALLBACK_CENTER: [number, number] = [23.8103, 90.4125];

    const setupMap = () => {
      if (!window.L || !mapRef.current) return;

      const center = riderLoc
        ? ([riderLoc.lat, riderLoc.lng] as [number, number])
        : destLoc
          ? ([destLoc.lat, destLoc.lng] as [number, number])
          : FALLBACK_CENTER;

      if (!leafletMapRef.current) {
        leafletMapRef.current = window.L.map(mapRef.current).setView(
          center,
          riderLoc || destLoc ? 14 : 12,
        );

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          },
        ).addTo(leafletMapRef.current);

        // Fix Leaflet sizing issues when the map container was
        // hidden/zero-size at the moment of initialization.
        setTimeout(() => {
          leafletMapRef.current?.invalidateSize();
        }, 200);
      }

      const map = leafletMapRef.current;

      if (destLoc) {
        if (!destMarkerRef.current) {
          destMarkerRef.current = window.L.marker([destLoc.lat, destLoc.lng], {
            title: "Delivery location",
          }).addTo(map);
        } else {
          destMarkerRef.current.setLatLng([destLoc.lat, destLoc.lng]);
        }
      }

      if (riderLoc) {
        const riderIcon = window.L.divIcon({
          className: "",
          html: '<div style="background:#f97316;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #f97316;"></div>',
          iconSize: [16, 16],
        });

        if (!riderMarkerRef.current) {
          riderMarkerRef.current = window.L.marker(
            [riderLoc.lat, riderLoc.lng],
            {
              icon: riderIcon,
              title: "Rider",
            },
          ).addTo(map);
        } else {
          riderMarkerRef.current.setLatLng([riderLoc.lat, riderLoc.lng]);
        }
      }

      if (riderLoc && destLoc) {
        const latlngs = [
          [riderLoc.lat, riderLoc.lng],
          [destLoc.lat, destLoc.lng],
        ];

        if (!routeLineRef.current) {
          routeLineRef.current = window.L.polyline(latlngs, {
            color: "#f97316",
            weight: 3,
            dashArray: "6 8",
          }).addTo(map);
        } else {
          routeLineRef.current.setLatLngs(latlngs);
        }

        map.fitBounds(latlngs, { padding: [40, 40] });
      } else if (riderLoc) {
        map.panTo([riderLoc.lat, riderLoc.lng]);
      }
    };

    if (window.L) {
      setupMap();
    } else {
      const check = setInterval(() => {
        if (window.L) {
          clearInterval(check);
          setupMap();
        }
      }, 300);
      return () => clearInterval(check);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Loader2 size={17} className="animate-spin text-orange-500" />
          Loading your order...
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

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status,
  );
  const riderLoc = order.riderId?.currentLocation;
  const destLoc = order.deliveryLocation;

  let etaText = "Calculating...";
  if (riderLoc && destLoc) {
    const distanceKm = haversineDistanceKm(
      riderLoc.lat,
      riderLoc.lng,
      destLoc.lat,
      destLoc.lng,
    );
    etaText = `${estimateEtaMinutes(distanceKm)} min · ${distanceKm.toFixed(1)} km away`;
  } else if (!order.riderId) {
    etaText = "Waiting for a rider to be assigned";
  } else if (!riderLoc) {
    etaText = "Waiting for rider's live location";
  }

  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <button
          onClick={() => router.push("/customer")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-orange-500"
        >
          <ArrowLeft size={17} />
          Back to restaurants
        </button>

        <div className="mb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Order #{order._id.slice(-6).toUpperCase()}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {isDelivered
              ? "Your order has arrived!"
              : isCancelled
                ? "Order cancelled"
                : "Your order is on its way"}
          </h1>
        </div>

        {/* Status stepper */}
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex min-w-max items-center justify-between gap-1 sm:min-w-0">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const done = !isCancelled && index <= currentStepIndex;

              return (
                <div
                  key={step.key}
                  className="flex flex-1 flex-col items-center"
                >
                  <div className="flex w-full items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                        done
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`mx-1 h-1 flex-1 rounded ${
                          index < currentStepIndex && !isCancelled
                            ? "bg-orange-500"
                            : "bg-gray-100"
                        }`}
                      />
                    )}
                  </div>

                  <span className="mt-2 max-w-[70px] text-center text-[10px] font-semibold uppercase leading-tight text-gray-500">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ETA + rider card */}
        {!isCancelled && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Estimated arrival
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {etaText}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Bike size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Your rider
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {order.riderId ? order.riderId.name : "Not assigned yet"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {order.riderId ? order.riderId.phone : "Not assigned yet"}
                  </p>
                </div>
              </div>

              {order.riderId && (
                <a
                  href={`tel:${order.riderId.phone}`}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
                >
                  <Phone size={17} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Live map */}
        {!isCancelled && (
          <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div
              ref={mapRef}
              className="h-72 w-full sm:h-96"
              style={{ background: "#f3f4f6" }}
            />
            {!riderLoc && (
              <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Waiting for the rider&apos;s live location...
              </div>
            )}
          </div>
        )}

        {/* Delivery + order summary */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <MapPin size={16} className="text-orange-500" />
              Delivery address
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {order.deliveryAddress}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-bold text-gray-900">Order summary</p>

            <div className="mt-3 space-y-1.5">
              {order.items.map((item) => (
                <div
                  key={item.foodId}
                  className="flex justify-between text-xs text-gray-500"
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-semibold text-gray-700">
                    ৳{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-base font-extrabold text-orange-500">
                ৳{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
